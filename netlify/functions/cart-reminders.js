// ═══════════════════════════════════════════════════════════════
// تذكير السلّة المتروكة — دالّة مجدولة (كلّ ساعة عبر netlify.toml)
// تبحث في abandoned_carts عن سلال مرّ عليها 24 ساعة بلا تذكير، وتُرسل
// رسالة (أسماء + أسعار فقط) عبر Brevo، ثمّ تُعلّمها reminded=true.
// متطلّب: BREVO_API_KEY في بيئة Netlify.
// ═══════════════════════════════════════════════════════════════
const { initializeApp, getApps } = require('firebase/app')
const { getFirestore, collection, getDocs, query, where, doc, updateDoc, terminate } = require('firebase/firestore')

const firebaseConfig = {
  apiKey: 'AIzaSyBscR9mr_iGGJhIExdJYFqXF1GpOyzw89U',
  authDomain: 'aromena-spices-storage.firebaseapp.com',
  projectId: 'aromena-spices-storage',
  storageBucket: 'aromena-spices-storage.firebasestorage.app',
  messagingSenderId: '837601798137',
  appId: '1:837601798137:web:da30b5208b84384e8dff28',
}

const SITE   = process.env.SITE_URL || 'https://aromena.com.tr'
const LOGO   = 'https://res.cloudinary.com/dvt0nntn7/image/upload/v1775408607/02_fwrhni.png'
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'aromena.official@gmail.com'
const SENDER_NAME  = process.env.SENDER_NAME  || 'Aromena Spices'

function fmtTRY(n) {
  return '₺' + (Number(n) || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function buildHtml(cart) {
  const name = cart.firstName || 'عزيزي العميل'
  const rows = (cart.items || []).map(it => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #F5E6D3;text-align:right;color:#3E1C00;font-size:14px;font-weight:600">
        ${it.name || ''}${it.size ? ` <span style="color:#9C6B4E;font-weight:400;font-size:12px">(${it.size})</span>` : ''}
        ${it.qty > 1 ? ` <span style="color:#9C6B4E;font-weight:400;font-size:12px">×${it.qty}</span>` : ''}
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #F5E6D3;text-align:left;color:#7b192c;font-size:14px;font-weight:800;white-space:nowrap;direction:ltr">
        ${fmtTRY((Number(it.price) || 0) * (Number(it.qty) || 1))}
      </td>
    </tr>`).join('')

  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
  <body style="margin:0;background:#F5E6D3;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl">
    <div style="max-width:600px;margin:0 auto;padding:24px 16px">
      <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(123,25,44,.10)">
        <div style="background:linear-gradient(135deg,#5a0f1e,#7b192c);padding:26px;text-align:center">
          <img src="${LOGO}" alt="Aromena" style="width:120px;height:auto"/>
        </div>
        <div style="padding:28px 24px">
          <div style="text-align:center;margin-bottom:18px">
            <div style="font-size:38px">🛒</div>
            <h1 style="color:#3E1C00;font-size:22px;margin:8px 0">سلّتك ما زالت تنتظرك</h1>
            <p style="color:#6B3A2A;font-size:14px;line-height:1.8;margin:0">
              مرحباً ${name} 🌿<br/>
              لاحظنا أنّك تركتَ بعض الكنوز في سلّتك ولم تُكمل طلبك بعد…<br/>
              لا تقلق — بهاراتنا الأصيلة ما زالت محفوظة لك، فـ<strong style="color:#7b192c">خلطتنا سرّ وصفتك</strong> 😋
            </p>
          </div>

          <table width="100%" style="border-collapse:collapse;background:#FFFBF5;border-radius:12px;overflow:hidden;border:1px solid #E2C9A8">
            ${rows}
            <tr>
              <td style="padding:12px 14px;text-align:right;color:#3E1C00;font-weight:800;font-size:15px">الإجمالي</td>
              <td style="padding:12px 14px;text-align:left;color:#7b192c;font-weight:900;font-size:16px;direction:ltr">${fmtTRY(cart.total)}</td>
            </tr>
          </table>

          <div style="text-align:center;margin:26px 0 10px">
            <a href="${SITE}/checkout" style="display:inline-block;background:linear-gradient(to left,#7b192c,#a82040);color:#f4be69;padding:14px 38px;border-radius:50px;font-weight:800;font-size:15px;text-decoration:none">
              أكمل الشراء ✨
            </a>
          </div>

          <p style="text-align:center;color:#9C6B4E;font-size:12px;margin-top:18px">
            أيّ سؤال؟ نحن هنا لخدمتك — <a href="https://wa.me/905550044476" style="color:#7b192c;font-weight:700">تواصل عبر واتساب</a>
          </p>
          <p style="text-align:center;color:#9C6B4E;font-size:12px;margin-top:6px">مع حبّنا، فريق أرومينا للبهارات</p>
        </div>
      </div>
    </div>
  </body></html>`
}

async function sendEmail(apiKey, to, toName, html) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to, name: toName || to }],
      subject: 'سلّتك ما زالت تنتظرك 🛒 — أكمل طلبك من أرومينا',
      htmlContent: html,
    }),
  })
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`)
}

exports.handler = async () => {
  const API_KEY = process.env.BREVO_API_KEY
  if (!API_KEY) return { statusCode: 500, body: 'BREVO_API_KEY missing' }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  const db = getFirestore(app)

  const cutoff = new Date(Date.now() - 1 * 60 * 1000).toISOString()          // ⚠️ مؤقّت للاختبار: دقيقة واحدة (الأصل 24*3600*1000 = 24 ساعة)
  const tooOld = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()  // تجاهل أقدم من 30 يوماً

  let sent = 0, skipped = 0
  try {
    const snap = await getDocs(query(collection(db, 'abandoned_carts'), where('reminded', '==', false)))
    for (const d of snap.docs) {
      const c = d.data()
      if (!c.email || !(c.items && c.items.length)) { skipped++; continue }
      if (!c.updatedAt || c.updatedAt > cutoff || c.updatedAt < tooOld) { skipped++; continue }
      try {
        await sendEmail(API_KEY, c.email, c.firstName, buildHtml(c))
        await updateDoc(doc(db, 'abandoned_carts', d.id), { reminded: true, remindedAt: new Date().toISOString() })
        sent++
      } catch (e) {
        console.error('reminder failed for', d.id, String(e && e.message || e))
      }
    }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e && e.message || e) }) }
  } finally {
    try { await terminate(db) } catch { /* */ }
  }

  return { statusCode: 200, body: JSON.stringify({ sent, skipped }) }
}
