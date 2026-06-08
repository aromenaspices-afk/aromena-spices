// ═══════════════════════════════════════════════════════════════
// Iyzico — التحقّق من نتيجة الدفع عبر التوكن (Checkout Form Retrieve)
// الواجهة ترسل { token } → نسأل Iyzico عن الحالة الحقيقيّة ونعيدها.
// هذا هو المصدر الموثوق للنجاح/الفشل (لا يعتمد على بيانات المتصفّح).
// ═══════════════════════════════════════════════════════════════
const Iyzipay = require('iyzipay')
const JSON_HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { ...JSON_HEADERS, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const API_KEY    = process.env.IYZICO_API_KEY
  const SECRET_KEY = process.env.IYZICO_SECRET_KEY
  const BASE_URL   = process.env.IYZICO_BASE_URL || 'https://api.iyzipay.com'
  if (!API_KEY || !SECRET_KEY) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Iyzico keys not configured' }) }
  }

  let token = ''
  try { token = (JSON.parse(event.body || '{}').token || '').trim() } catch {}
  if (!token) return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Missing token' }) }

  const iyzipay = new Iyzipay({ apiKey: API_KEY, secretKey: SECRET_KEY, uri: BASE_URL })

  try {
    const result = await new Promise((resolve, reject) => {
      iyzipay.checkoutForm.retrieve({ locale: Iyzipay.LOCALE.TR, token }, (err, res) => (err ? reject(err) : resolve(res)))
    })
    const success = result.status === 'success' && result.paymentStatus === 'SUCCESS'
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({
      success,
      orderId: result.basketId || result.conversationId || null,
      paymentId: result.paymentId || null,
      paidPrice: result.paidPrice || null,
      currency: result.currency || null,
      paymentStatus: result.paymentStatus || null,
      errorMessage: success ? null : (result.errorMessage || 'Payment not completed'),
    }) }
  } catch (e) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: String(e && e.message || e) }) }
  }
}
