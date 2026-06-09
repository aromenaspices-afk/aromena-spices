// ═══════════════════════════════════════════════════════════════
// Iyzico — تهيئة نموذج الدفع (Edge Function / Deno) قرب تركيا
// توقيع IYZWSv2 يدويّ (HMAC-SHA256 عبر Web Crypto) — بلا مكتبة Node.
// يقرأ نفس متغيّرات بيئة Netlify: IYZICO_API_KEY/SECRET_KEY/BASE_URL/SITE_URL
// ملاحظة: دالّة Node /.netlify/functions/iyzico-init تبقى كشبكة أمان للتراجع.
// ═══════════════════════════════════════════════════════════════
export const config = { path: '/api/iyzico-init' }

const J = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP']

function env(k) {
  try { return Netlify.env.get(k) } catch { /* */ }
  try { return Deno.env.get(k) } catch { /* */ }
  return undefined
}
function money(n) { return (Math.round((Number(n) || 0) * 100) / 100).toFixed(2) }
function rndStr() { return Date.now().toString() + Math.random().toString(36).slice(2, 12) }

async function hmacHex(secret, msg) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg))
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('')
}
// IYZWSv2: signature = HMAC-SHA256(randomKey + uriPath + body) بالـhex
async function authV2(apiKey, secretKey, uriPath, body, rnd) {
  const signature = await hmacHex(secretKey, rnd + uriPath + body)
  const params = `apiKey:${apiKey}&randomKey:${rnd}&signature:${signature}`
  return 'IYZWSv2 ' + btoa(params)
}

export default async (request, context) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { ...J, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } })
  }
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: J })
  }

  const API_KEY = env('IYZICO_API_KEY')
  const SECRET  = env('IYZICO_SECRET_KEY')
  const BASE    = env('IYZICO_BASE_URL') || 'https://api.iyzipay.com'
  const SITE    = env('SITE_URL') || 'https://aromena.com.tr'
  if (!API_KEY || !SECRET) {
    return new Response(JSON.stringify({ error: 'Iyzico keys not configured' }), { status: 500, headers: J })
  }

  let data
  try { data = await request.json() } catch { return new Response(JSON.stringify({ error: 'Bad JSON' }), { status: 400, headers: J }) }

  const { orderId, currency = 'TRY', items = [], shipping = 0, paidTotal, buyer = {}, address = {} } = data
  if (!orderId || !items.length || !paidTotal) {
    return new Response(JSON.stringify({ error: 'Missing order data' }), { status: 400, headers: J })
  }

  const basketItems = items.map((it, i) => ({
    id: String(it.id || `item-${i}`),
    name: String(it.name || 'منتج').slice(0, 100),
    category1: 'Spices',
    itemType: 'PHYSICAL',
    price: money((Number(it.price) || 0) * (Number(it.qty) || 1)),
  }))
  let sum = basketItems.reduce((s, b) => s + Number(b.price), 0)
  if (Number(shipping) > 0) {
    basketItems.push({ id: 'shipping', name: 'Shipping', category1: 'Shipping', itemType: 'PHYSICAL', price: money(shipping) })
    sum += Number(money(shipping))
  }
  const price = money(sum)
  const paidPrice = money(paidTotal)
  const CUR = CURRENCIES.includes(currency) ? currency : 'TRY'

  const ip = context.ip || '85.34.78.112'
  const fullName = `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || 'Müşteri'
  const addrText = String(address.full || address.line || buyer.address || 'Türkiye').slice(0, 200)
  const city = String(address.city || buyer.city || 'Istanbul').slice(0, 60)
  const country = String(address.country || buyer.country || 'Turkey').slice(0, 60)
  const zip = String(address.zip || '34000').slice(0, 15)

  const reqObj = {
    locale: 'tr',
    conversationId: String(orderId),
    price, paidPrice, currency: CUR,
    basketId: String(orderId),
    paymentGroup: 'PRODUCT',
    callbackUrl: `${SITE}/.netlify/functions/iyzico-callback`,
    enabledInstallments: [1],
    buyer: {
      id: String(buyer.uid || orderId),
      name: (buyer.firstName || 'Müşteri').slice(0, 50),
      surname: (buyer.lastName || 'Aromena').slice(0, 50),
      gsmNumber: String(buyer.phone || '+905555555555').slice(0, 25),
      email: String(buyer.email || 'no-reply@aromena.com.tr').slice(0, 80),
      identityNumber: '11111111111',
      registrationAddress: addrText,
      ip, city, country, zipCode: zip,
    },
    shippingAddress: { contactName: fullName, city, country, address: addrText, zipCode: zip },
    billingAddress:  { contactName: fullName, city, country, address: addrText, zipCode: zip },
    basketItems,
  }

  const uriPath = '/payment/iyzipos/checkoutform/initialize/auth/ecom'
  const body = JSON.stringify(reqObj)
  const rnd = rndStr()
  const auth = await authV2(API_KEY, SECRET, uriPath, body, rnd)

  try {
    const r = await fetch(BASE + uriPath, {
      method: 'POST',
      headers: { 'Authorization': auth, 'x-iyzi-rnd': rnd, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body,
    })
    const result = await r.json()
    if (result.status !== 'success') {
      return new Response(JSON.stringify({ error: result.errorMessage || 'Iyzico init failed', code: result.errorCode }), { status: 400, headers: J })
    }
    return new Response(JSON.stringify({
      token: result.token,
      checkoutFormContent: result.checkoutFormContent,
      paymentPageUrl: result.paymentPageUrl,
      tokenExpireTime: result.tokenExpireTime,
    }), { status: 200, headers: J })
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e && e.message) || e) }), { status: 500, headers: J })
  }
}
