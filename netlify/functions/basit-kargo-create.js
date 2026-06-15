// ═══════════════════════════════════════════════════════════════
// Basit Kargo — إنشاء شحنة (Create Order) من لوحة الإدارة
// التوكِن خادميّ فقط: متغيّر بيئة Netlify  BASIT_KARGO_TOKEN
// (اختياري) BASIT_KARGO_ADDRESS_ID لعنوان مُرسِل محدّد.
// المدخل: { order, handlerCode }  — order = وثيقة الطلب كاملةً.
// ═══════════════════════════════════════════════════════════════
const J = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
const BASE = 'https://basitkargo.com/api'
const VALID = ['ARAS', 'HEPSIJET', 'SURAT', 'PTT', 'KOLAYGELSIN', 'YURTICI', 'MNG', 'ECONOMIC', 'FAST']

// تطبيع الهاتف للصيغة التركيّة: 10 أرقام تبدأ بـ5 (حذف +90 / 90 / 0 البادئة)
function trPhone(raw) {
  let d = String(raw || '').replace(/\D/g, '')
  if (d.startsWith('90')) d = d.slice(2)
  if (d.startsWith('0')) d = d.slice(1)
  return d.slice(-10)
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { ...J, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: J, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const TOKEN = process.env.BASIT_KARGO_TOKEN
  const ADDRESS_ID = process.env.BASIT_KARGO_ADDRESS_ID || undefined
  if (!TOKEN) {
    return { statusCode: 500, headers: J, body: JSON.stringify({ error: 'BASIT_KARGO_TOKEN غير مضبوط في Netlify' }) }
  }

  let data
  try { data = JSON.parse(event.body || '{}') } catch { return { statusCode: 400, headers: J, body: JSON.stringify({ error: 'Bad JSON' }) } }

  const { order, handlerCode } = data
  if (!order || !handlerCode) return { statusCode: 400, headers: J, body: JSON.stringify({ error: 'Missing order/handlerCode' }) }
  if (!VALID.includes(handlerCode)) return { statusCode: 400, headers: J, body: JSON.stringify({ error: `رمز شركة غير صالح: ${handlerCode}` }) }

  const c = order.customer || {}
  const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Müşteri'
  const phone = trPhone(c.phone)
  const city = (c.city || '').trim()         // الولاية İl
  const town = (c.district || '').trim()     // المنطقة İlçe
  const address = (c.fullAddress || [c.district, c.neighborhood, c.address].filter(Boolean).join('، ') || c.address || '').trim()

  // تحقّق من اكتمال العنوان قبل الإرسال
  const missing = []
  if (!phone || !/^5[0-9]{9}$/.test(phone)) missing.push('هاتف تركيّ صالح (يبدأ بـ5، 10 أرقام)')
  if (!city) missing.push('المدينة (İl)')
  if (!town) missing.push('المنطقة (İlçe)')
  if (!address) missing.push('العنوان')
  if (missing.length) {
    return { statusCode: 422, headers: J, body: JSON.stringify({ error: `بيانات ناقصة لإنشاء الشحنة: ${missing.join('، ')}` }) }
  }

  // الوزن: مجموع أوزان العناصر إن وُجدت، وإلّا تقدير من الكمّيّة (حدّ أدنى 1كغ)
  const items = order.items || []
  let weight = items.reduce((s, it) => s + (Number(it.weightKg) || 0) * (Number(it.qty) || 1), 0)
  if (!weight) weight = Math.max(1, items.reduce((s, it) => s + (Number(it.qty) || 1), 0) * 0.3)
  weight = Math.round(weight * 100) / 100

  const isCod = (order.payment?.method === 'cod') && (order.payment?.status !== 'paid')
  const codAmount = isCod ? Math.round(Number(order.pricingTRY?.total || order.pricing?.total || 0)) : 0
  if (isCod && codAmount <= 0) {
    return { statusCode: 422, headers: J, body: JSON.stringify({ error: 'مبلغ الدفع عند التسليم غير صالح (يجب أن يكون أكبر من 0)' }) }
  }

  const body = {
    handlerCode,
    type: 'OUTGOING',
    ...(ADDRESS_ID ? { addressId: ADDRESS_ID } : {}),
    content: {
      name: `Sipariş ${order.orderNumber || ''}`.trim(),
      code: String(order.orderNumber || order.id || ''),
      packages: [{ weight, height: 10, width: 15, depth: 20 }],
    },
    client: { name, phone, city, town, address },
    ...(isCod && codAmount > 0 ? { collect: codAmount, collectOnDeliveryType: 'CASH' } : {}),
  }

  try {
    const r = await fetch(`${BASE}/v2/order/barcode`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
    })
    const text = await r.text()
    let result; try { result = JSON.parse(text) } catch { result = { raw: text } }
    if (!r.ok) {
      // استخراج رسالة الخطأ الحقيقيّة من ردّ Basit Kargo
      const reason = (result && (result.message || result.errorMessage || result.error || result.title
        || (Array.isArray(result.errors) ? result.errors.join('، ') : '')
        || (typeof result.raw === 'string' ? result.raw : ''))) || `HTTP ${r.status}`
      return { statusCode: r.status, headers: J, body: JSON.stringify({ error: String(reason), status: r.status, detail: result }) }
    }
    // رابط التتبّع فقط إن وفّره Basit Kargo في الرد — لا نبني رابطاً من عندنا
    const apiTrackingUrl = result.trackingUrl || result.trackingLink || result.url || result.link
      || result.shareUrl || result.cargoTrackingUrl || result.publicUrl || null
    return { statusCode: 200, headers: J, body: JSON.stringify({
      ok: true,
      id: result.id || null,
      barcode: result.barcode || null,
      status: result.status || null,
      trackingUrl: apiTrackingUrl,
      handlerCode,
      raw: result,
    }) }
  } catch (e) {
    return { statusCode: 500, headers: J, body: JSON.stringify({ error: String((e && e.message) || e) }) }
  }
}
