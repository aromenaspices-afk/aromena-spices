// ═══════════════════════════════════════════════════════════════
// Iyzico — التحقّق من نتيجة الدفع (Edge Function / Deno) قرب تركيا
// توقيع IYZWSv2 يدويّ (HMAC-SHA256 عبر Web Crypto). المصدر الموثوق للنجاح/الفشل.
// دالّة Node /.netlify/functions/iyzico-verify تبقى كشبكة أمان للتراجع.
// ═══════════════════════════════════════════════════════════════
export const config = { path: '/api/iyzico-verify' }

const J = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }

function env(k) {
  try { return Netlify.env.get(k) } catch { /* */ }
  try { return Deno.env.get(k) } catch { /* */ }
  return undefined
}
function rndStr() { return Date.now().toString() + Math.random().toString(36).slice(2, 12) }

async function hmacHex(secret, msg) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg))
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('')
}
async function authV2(apiKey, secretKey, uriPath, body, rnd) {
  const signature = await hmacHex(secretKey, rnd + uriPath + body)
  const params = `apiKey:${apiKey}&randomKey:${rnd}&signature:${signature}`
  return 'IYZWSv2 ' + btoa(params)
}

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { ...J, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } })
  }
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: J })
  }

  const API_KEY = env('IYZICO_API_KEY')
  const SECRET  = env('IYZICO_SECRET_KEY')
  const BASE    = env('IYZICO_BASE_URL') || 'https://api.iyzipay.com'
  if (!API_KEY || !SECRET) {
    return new Response(JSON.stringify({ error: 'Iyzico keys not configured' }), { status: 500, headers: J })
  }

  let token = ''
  try { token = (((await request.json()) || {}).token || '').trim() } catch { /* */ }
  if (!token) return new Response(JSON.stringify({ error: 'Missing token' }), { status: 400, headers: J })

  const uriPath = '/payment/iyzipos/checkoutform/auth/ecom/detail'
  const body = JSON.stringify({ locale: 'tr', token })
  const rnd = rndStr()
  const auth = await authV2(API_KEY, SECRET, uriPath, body, rnd)

  try {
    const r = await fetch(BASE + uriPath, {
      method: 'POST',
      headers: { 'Authorization': auth, 'x-iyzi-rnd': rnd, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body,
    })
    const result = await r.json()
    const success = result.status === 'success' && result.paymentStatus === 'SUCCESS'
    return new Response(JSON.stringify({
      success,
      orderId: result.basketId || result.conversationId || null,
      paymentId: result.paymentId || null,
      paidPrice: result.paidPrice || null,
      currency: result.currency || null,
      paymentStatus: result.paymentStatus || null,
      errorMessage: success ? null : (result.errorMessage || 'Payment not completed'),
    }), { status: 200, headers: J })
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e && e.message) || e) }), { status: 500, headers: J })
  }
}
