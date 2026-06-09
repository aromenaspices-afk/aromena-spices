// ═══════════════════════════════════════════════════════════════
// إرسال البريد عبر Brevo من الخادم (المفتاح لا يُكشَف للمتصفّح)
// متغيّرات بيئة Netlify المطلوبة:
//   BREVO_API_KEY     مفتاح Brevo (بدون بادئة VITE_ — خادميّ فقط)
//   SENDER_EMAIL      اختياري — افتراضي aromena.official@gmail.com
//   SENDER_NAME       اختياري — افتراضي Aromena Spices
// ═══════════════════════════════════════════════════════════════
const JSON_HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { ...JSON_HEADERS, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const API_KEY      = process.env.BREVO_API_KEY
  const SENDER_EMAIL = process.env.SENDER_EMAIL || 'aromena.official@gmail.com'
  const SENDER_NAME  = process.env.SENDER_NAME  || 'Aromena Spices'
  if (!API_KEY) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'BREVO_API_KEY not configured' }) }
  }

  let data
  try { data = JSON.parse(event.body || '{}') } catch { return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Bad JSON' }) } }

  const { to, toName, subject, html, replyTo } = data
  if (!to || !subject || !html) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Missing to/subject/html' }) }
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': API_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: to, name: toName || to }],
        ...(replyTo ? { replyTo: { email: replyTo } } : {}),
        subject,
        htmlContent: html,
      }),
    })
    const txt = await res.text()
    if (!res.ok) {
      return { statusCode: res.status, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Brevo error', detail: txt }) }
    }
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) }
  } catch (e) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: String(e && e.message || e) }) }
  }
}
