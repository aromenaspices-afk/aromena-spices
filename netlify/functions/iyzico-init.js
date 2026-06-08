// ═══════════════════════════════════════════════════════════════
// Iyzico — تهيئة نموذج الدفع المضمّن (Checkout Form Initialize)
// يقرأ المفاتيح من متغيّرات بيئة Netlify (لا تُوضَع في الكود)
//   IYZICO_API_KEY        مفتاح API
//   IYZICO_SECRET_KEY     المفتاح السرّي
//   IYZICO_BASE_URL       https://api.iyzipay.com  (الإنتاج) — اختياري
//   SITE_URL              https://aromena.com.tr   — اختياري
// ═══════════════════════════════════════════════════════════════
const Iyzipay = require('iyzipay')

const JSON_HEADERS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }

function money(n) { return (Math.round((Number(n) || 0) * 100) / 100).toFixed(2) }

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
  const SITE_URL   = process.env.SITE_URL || 'https://aromena.com.tr'

  if (!API_KEY || !SECRET_KEY) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Iyzico keys not configured' }) }
  }

  let data
  try { data = JSON.parse(event.body || '{}') } catch { return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Bad JSON' }) } }

  const { orderId, currency = 'TRY', items = [], shipping = 0, paidTotal, buyer = {}, address = {} } = data
  if (!orderId || !items.length || !paidTotal) {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Missing order data' }) }
  }

  // عناصر السلّة — يجب أن يساوي مجموعها price
  const basketItems = items.map((it, i) => ({
    id: String(it.id || `item-${i}`),
    name: String(it.name || 'منتج').slice(0, 100),
    category1: 'Spices',
    itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
    price: money((Number(it.price) || 0) * (Number(it.qty) || 1)),
  }))
  let itemsSum = basketItems.reduce((s, b) => s + Number(b.price), 0)
  if (Number(shipping) > 0) {
    basketItems.push({ id: 'shipping', name: 'Shipping', category1: 'Shipping', itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL, price: money(shipping) })
    itemsSum += Number(money(shipping))
  }
  const price     = money(itemsSum)       // أساس السلّة (للتقسيط)
  const paidPrice = money(paidTotal)      // المبلغ المدفوع فعلاً (بعد الخصم)

  const ip = (event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || '85.34.78.112').split(',')[0].trim()
  const fullName = `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || 'Müşteri'
  const addrText = (address.full || address.line || buyer.address || 'Türkiye').slice(0, 200)
  const city     = (address.city || buyer.city || 'Istanbul').slice(0, 60)
  const country  = (address.country || buyer.country || 'Turkey').slice(0, 60)

  const iyzipay = new Iyzipay({ apiKey: API_KEY, secretKey: SECRET_KEY, uri: BASE_URL })

  const CUR = (Iyzipay.CURRENCY[currency] ? currency : 'TRY')

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: String(orderId),
    price,
    paidPrice,
    currency: Iyzipay.CURRENCY[CUR],
    basketId: String(orderId),
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl: `${SITE_URL}/.netlify/functions/iyzico-callback`,
    enabledInstallments: [1],
    buyer: {
      id: String(buyer.uid || orderId),
      name: (buyer.firstName || 'Müşteri').slice(0, 50),
      surname: (buyer.lastName || 'Aromena').slice(0, 50),
      gsmNumber: String(buyer.phone || '+905555555555').slice(0, 25),
      email: String(buyer.email || 'no-reply@aromena.com.tr').slice(0, 80),
      identityNumber: '11111111111',
      registrationAddress: addrText,
      ip,
      city,
      country,
      zipCode: String(address.zip || '34000').slice(0, 15),
    },
    shippingAddress: { contactName: fullName, city, country, address: addrText, zipCode: String(address.zip || '34000').slice(0, 15) },
    billingAddress:  { contactName: fullName, city, country, address: addrText, zipCode: String(address.zip || '34000').slice(0, 15) },
    basketItems,
  }

  try {
    const result = await new Promise((resolve, reject) => {
      iyzipay.checkoutFormInitialize.create(request, (err, res) => (err ? reject(err) : resolve(res)))
    })
    if (result.status !== 'success') {
      return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: result.errorMessage || 'Iyzico init failed', code: result.errorCode }) }
    }
    return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({
      token: result.token,
      checkoutFormContent: result.checkoutFormContent,
      paymentPageUrl: result.paymentPageUrl,
      tokenExpireTime: result.tokenExpireTime,
    }) }
  } catch (e) {
    return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: String(e && e.message || e) }) }
  }
}
