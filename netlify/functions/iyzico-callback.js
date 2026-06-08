// ═══════════════════════════════════════════════════════════════
// Iyzico — استقبال نتيجة الدفع من Iyzico ثمّ تحويل العميل لصفحة النتيجة
// Iyzico يرسل POST (x-www-form-urlencoded) يحوي token.
// نحوّل المتصفّح لصفحة /payment-result مع التوكن، والتحقّق الفعليّ
// يتمّ في الواجهة عبر دالّة iyzico-verify (لا يمكن تزويره).
// ═══════════════════════════════════════════════════════════════
exports.handler = async (event) => {
  const SITE_URL = process.env.SITE_URL || 'https://aromena.com.tr'

  let token = ''
  try {
    const body = event.body || ''
    const decoded = event.isBase64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body
    const params = new URLSearchParams(decoded)
    token = params.get('token') || ''
  } catch { /* تجاهل */ }

  const dest = token
    ? `${SITE_URL}/payment-result?token=${encodeURIComponent(token)}`
    : `${SITE_URL}/payment-result?status=failure`

  return {
    statusCode: 302,
    headers: { Location: dest, 'Cache-Control': 'no-store' },
    body: '',
  }
}
