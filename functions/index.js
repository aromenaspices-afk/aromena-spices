const functions = require('firebase-functions')
const admin     = require('firebase-admin')

admin.initializeApp()

// ═══════════════════════════════════════════
// Brevo API helper
// ═══════════════════════════════════════════
async function sendEmail({ to, toName, subject, html }) {
  const config = functions.config()
  const apiKey = config.brevo?.api_key
  const senderEmail = config.brevo?.sender_email || 'aromena.official@gmail.com'
  const senderName  = config.brevo?.sender_name  || 'Aromena Spices'

  if (!apiKey) {
    console.error('Brevo API key not configured')
    return
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender:   { name: senderName, email: senderEmail },
      to:       [{ email: to, name: toName || to }],
      subject,
      htmlContent: html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Brevo error:', err)
  } else {
    console.log(`Email sent to ${to}: ${subject}`)
  }
}

// ═══════════════════════════════════════════
// STYLES — مشتركة بين كل القوالب
// ═══════════════════════════════════════════
const LOGO = 'https://res.cloudinary.com/dvt0nntn7/image/upload/v1773706292/%D8%AF%D9%88%D9%86_%D8%B9%D9%86%D9%88%D8%A7%D9%86_1000_x_300_%D8%A8%D9%8A%D9%83%D8%B3%D9%84_yjbttl.png'
const SITE = 'https://aromina.com.tr'

function emailWrapper(content) {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#F5E6D3; font-family:'Segoe UI',Tahoma,Arial,sans-serif; direction:rtl; }
    .wrapper { max-width:600px; margin:0 auto; padding:24px 16px; }
    .card { background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 4px 24px rgba(123,25,44,0.10); }
    .header { background:linear-gradient(135deg,#7b192c,#a82040); padding:28px 32px; text-align:center; }
    .header img { width:200px; max-width:80%; }
    .body { padding:32px; }
    .footer { background:#fdf0f2; padding:20px 32px; text-align:center; border-top:1px solid #f0d4d8; }
    .footer p { color:#9C6B4E; font-size:12px; line-height:1.8; }
    .footer a { color:#7b192c; text-decoration:none; font-weight:600; }
    h1 { color:#3E1C00; font-size:22px; margin-bottom:8px; }
    h2 { color:#3E1C00; font-size:16px; margin-bottom:16px; }
    p  { color:#6B3A2A; font-size:14px; line-height:1.8; }
    .badge { display:inline-block; padding:6px 18px; border-radius:50px; font-size:13px; font-weight:700; }
    .badge-gold    { background:#f4be69; color:#7b192c; }
    .badge-green   { background:#D1FAE5; color:#065F46; }
    .badge-blue    { background:#DBEAFE; color:#1E40AF; }
    .badge-orange  { background:#FEF3C7; color:#92400E; }
    .badge-red     { background:#FEE2E2; color:#991B1B; }
    .divider { height:1px; background:#F5E6D3; margin:20px 0; }
    .btn { display:inline-block; padding:12px 28px; border-radius:50px; text-decoration:none; font-weight:700; font-size:14px; }
    .btn-primary { background:linear-gradient(to left,#7b192c,#a82040); color:#f4be69; }
    .btn-outline  { background:#fff; color:#7b192c; border:2px solid #7b192c; }
    .order-box { background:#fdf0f2; border-radius:14px; padding:20px 24px; margin:20px 0; border:1px solid #f0d4d8; }
    .order-number { color:#7b192c; font-size:22px; font-weight:900; letter-spacing:2px; }
    .item-row { display:flex; align-items:center; gap:14px; padding:12px 0; border-bottom:1px solid #F5E6D3; }
    .item-img { width:60px; height:60px; border-radius:10px; object-fit:cover; background:#F5E6D3; flex-shrink:0; }
    .item-info { flex:1; }
    .item-name  { color:#3E1C00; font-size:14px; font-weight:700; }
    .item-size  { color:#9C6B4E; font-size:12px; }
    .item-price { color:#7b192c; font-size:14px; font-weight:900; white-space:nowrap; }
    .totals-row { display:flex; justify-content:space-between; padding:6px 0; }
    .totals-row span:first-child { color:#9C6B4E; font-size:13px; }
    .totals-row span:last-child  { color:#3E1C00; font-size:13px; font-weight:600; }
    .totals-total { border-top:2px solid #F5E6D3; margin-top:8px; padding-top:10px; }
    .totals-total span:first-child { color:#3E1C00; font-size:15px; font-weight:700; }
    .totals-total span:last-child  { color:#7b192c; font-size:18px; font-weight:900; }
    .info-row { display:flex; gap:10px; padding:8px 0; border-bottom:1px solid #F5E6D3; }
    .info-label { color:#9C6B4E; font-size:13px; min-width:110px; }
    .info-value { color:#3E1C00; font-size:13px; font-weight:600; }
    .tracking-box { background:#EFF6FF; border:1px solid #BFDBFE; border-radius:12px; padding:16px 20px; text-align:center; margin:16px 0; }
    .tracking-code { font-size:20px; font-weight:900; color:#1E40AF; letter-spacing:2px; }
    @media(max-width:480px) {
      .body { padding:20px 16px; }
      .item-img { width:44px; height:44px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <a href="${SITE}"><img src="${LOGO}" alt="Aromena Spices"/></a>
      </div>
      ${content}
      <div class="footer">
        <p>أرومينا للبهارات — بهارات أصيلة من قلب الشرق 🌶️</p>
        <p style="margin-top:6px">
          <a href="${SITE}">زيارة الموقع</a> &nbsp;|&nbsp;
          <a href="https://wa.me/905550044476">واتساب</a> &nbsp;|&nbsp;
          <a href="https://www.instagram.com/aromena.official?igsh=eTU3bWcycmI3djRt">إنستغرام</a>
        </p>
        <p style="margin-top:10px;color:#C4956A;font-size:11px">
          Aromena Spices © ${new Date().getFullYear()} — aromina.com.tr
        </p>
      </div>
    </div>
  </div>
</body>
</html>`
}

// ═══════════════════════════════════════════
// قوالب الإيميلات
// ═══════════════════════════════════════════

function buildWelcomeEmail({ firstName }) {
  return emailWrapper(`
    <div class="body">
      <h1>أهلاً وسهلاً ${firstName}! 🎉</h1>
      <p style="margin-bottom:16px">يسعدنا انضمامك لعائلة أرومينا للبهارات. نحن نقدم لك أجود البهارات الأصيلة من قلب الشرق مباشرة إلى مطبخك.</p>

      <div class="order-box" style="text-align:center">
        <p style="color:#7b192c;font-size:13px;margin-bottom:8px">🌶️ ابدأ تجربتك الآن</p>
        <h2 style="margin-bottom:16px">اكتشف تشكيلتنا الفاخرة من البهارات</h2>
        <a href="${SITE}/products" class="btn btn-primary" style="margin-left:8px">تسوق الآن</a>
        <a href="${SITE}/packages" class="btn btn-outline">الباقات</a>
      </div>

      <div class="divider"></div>

      <h2>ماذا تنتظرك؟</h2>
      <table width="100%" style="border-collapse:collapse">
        ${[
          ['🌿', 'بهارات 100% طبيعية', 'بدون مواد حافظة أو إضافات'],
          ['🚚', 'شحن سريع لأوروبا والخليج', 'توصيل في 3-10 أيام'],
          ['🎁', 'باقات هدايا مميزة', 'مثالية للمناسبات'],
          ['↩️', 'ضمان الجودة', 'إرجاع مجاني خلال 14 يوم'],
        ].map(([icon, title, desc]) => `
          <tr>
            <td style="padding:10px 0;vertical-align:top;width:40px;font-size:20px">${icon}</td>
            <td style="padding:10px 12px">
              <p style="color:#3E1C00;font-weight:700;font-size:14px;margin-bottom:2px">${title}</p>
              <p style="color:#9C6B4E;font-size:12px">${desc}</p>
            </td>
          </tr>
        `).join('')}
      </table>

      <div class="divider"></div>
      <p>إذا كان لديك أي سؤال، نحن هنا دائماً على <a href="https://wa.me/905550044476" style="color:#7b192c;font-weight:700">واتساب</a> أو <a href="mailto:aromena.official@gmail.com" style="color:#7b192c;font-weight:700">البريد الإلكتروني</a>.</p>
    </div>
  `)
}

function buildOrderConfirmEmail({ firstName, orderNumber, items, pricing, customer, payment, createdAt }) {
  const itemsHtml = (items || []).map(item => `
    <div class="item-row">
      ${item.image
        ? `<img src="${item.image}" alt="${item.name}" class="item-img"/>`
        : `<div class="item-img" style="display:flex;align-items:center;justify-content:center;font-size:24px">🫙</div>`
      }
      <div class="item-info">
        <p class="item-name">${item.name}</p>
        <p class="item-size">${item.size} × ${item.qty}</p>
      </div>
      <p class="item-price">€${(item.price * item.qty).toFixed(2)}</p>
    </div>
  `).join('')

  const date = createdAt ? new Date(createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

  return emailWrapper(`
    <div class="body">
      <div style="text-align:center;margin-bottom:20px">
        <div style="width:64px;height:64px;border-radius:50%;background:#f0fdf4;border:2px solid #BBF7D0;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px">✅</div>
        <h1>تم تأكيد طلبك!</h1>
        <p>شكراً ${firstName}، طلبك وصلنا وجاري المراجعة</p>
      </div>

      <div class="order-box" style="text-align:center">
        <p style="color:#9C6B4E;font-size:12px;margin-bottom:4px">رقم الطلب</p>
        <p class="order-number">${orderNumber}</p>
        ${date ? `<p style="color:#9C6B4E;font-size:12px;margin-top:6px">${date}</p>` : ''}
      </div>

      <h2 style="margin-bottom:0">تفاصيل الطلب</h2>
      ${itemsHtml}

      <div style="margin-top:16px">
        <div class="totals-row"><span>المجموع الفرعي</span><span>€${pricing.subtotal?.toFixed(2)}</span></div>
        <div class="totals-row"><span>الشحن</span><span style="color:${pricing.shipping===0?'#16A34A':'#3E1C00'}">${pricing.shipping===0?'مجاني':'€'+pricing.shipping?.toFixed(2)}</span></div>
        ${pricing.discount>0?`<div class="totals-row"><span>الخصم</span><span style="color:#16A34A">-€${pricing.discount?.toFixed(2)}</span></div>`:''}
        <div class="totals-row totals-total"><span>الإجمالي</span><span>€${pricing.total?.toFixed(2)}</span></div>
      </div>

      <div class="divider"></div>

      <h2>بيانات الشحن</h2>
      <div>
        ${[
          ['الاسم',        `${customer.firstName} ${customer.lastName}`],
          ['الإيميل',      customer.email],
          ['الهاتف',       customer.phone || '—'],
          ['العنوان',      customer.address || '—'],
          ['المدينة',      customer.city    || '—'],
          ['الدولة',       customer.country || '—'],
          ['طريقة الدفع', payment?.method  || '—'],
        ].map(([label, value]) => `
          <div class="info-row">
            <span class="info-label">${label}</span>
            <span class="info-value">${value}</span>
          </div>
        `).join('')}
      </div>

      <div class="divider"></div>
      <div style="text-align:center">
        <p style="margin-bottom:16px">سنتواصل معك قريباً لتأكيد الدفع وتفاصيل الشحن</p>
        <a href="${SITE}/account" class="btn btn-primary">متابعة طلبي</a>
      </div>
    </div>
  `)
}

function buildStatusUpdateEmail({ firstName, orderNumber, status, items, pricing }) {
  const statusMap = {
    pending:    { label: 'قيد المراجعة',   badge: 'badge-orange', icon: '⏳' },
    confirmed:  { label: 'تم التأكيد',      badge: 'badge-blue',   icon: '✅' },
    processing: { label: 'جاري التجهيز',    badge: 'badge-blue',   icon: '📦' },
    shipped:    { label: 'تم الشحن',        badge: 'badge-green',  icon: '🚚' },
    delivered:  { label: 'تم التسليم',      badge: 'badge-green',  icon: '🎉' },
    cancelled:  { label: 'تم الإلغاء',      badge: 'badge-red',    icon: '❌' },
  }
  const st = statusMap[status] || { label: status, badge: 'badge-orange', icon: '📋' }

  const previewItems = (items || []).slice(0, 3).map(item => `
    <div class="item-row">
      ${item.image
        ? `<img src="${item.image}" alt="${item.name}" class="item-img"/>`
        : `<div class="item-img" style="display:flex;align-items:center;justify-content:center;font-size:20px">🫙</div>`
      }
      <div class="item-info">
        <p class="item-name">${item.name}</p>
        <p class="item-size">${item.size} × ${item.qty}</p>
      </div>
      <p class="item-price">€${(item.price * item.qty).toFixed(2)}</p>
    </div>
  `).join('')

  return emailWrapper(`
    <div class="body">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:40px;margin-bottom:12px">${st.icon}</div>
        <h1>تحديث على طلبك</h1>
        <p style="margin-bottom:16px">مرحباً ${firstName}، هناك تحديث جديد على طلبك</p>
        <span class="badge ${st.badge}" style="font-size:14px;padding:8px 24px">${st.label}</span>
      </div>

      <div class="order-box" style="text-align:center">
        <p style="color:#9C6B4E;font-size:12px;margin-bottom:4px">رقم الطلب</p>
        <p class="order-number">${orderNumber}</p>
      </div>

      <h2>محتوى الطلب</h2>
      ${previewItems}
      ${items?.length > 3 ? `<p style="color:#9C6B4E;font-size:12px;text-align:center;margin-top:8px">و${items.length-3} منتجات أخرى...</p>` : ''}

      ${pricing ? `
      <div style="margin-top:12px">
        <div class="totals-row totals-total">
          <span>الإجمالي</span>
          <span>€${pricing.total?.toFixed(2)}</span>
        </div>
      </div>` : ''}

      <div class="divider"></div>
      <div style="text-align:center">
        <a href="${SITE}/account" class="btn btn-primary">عرض تفاصيل الطلب</a>
      </div>
    </div>
  `)
}

function buildTrackingEmail({ firstName, orderNumber, trackingNumber, carrier, trackingUrl, items }) {
  const previewItems = (items || []).slice(0, 2).map(item => `
    <div class="item-row">
      ${item.image
        ? `<img src="${item.image}" alt="${item.name}" class="item-img"/>`
        : `<div class="item-img" style="display:flex;align-items:center;justify-content:center;font-size:20px">🫙</div>`
      }
      <div class="item-info">
        <p class="item-name">${item.name}</p>
        <p class="item-size">${item.size} × ${item.qty}</p>
      </div>
    </div>
  `).join('')

  return emailWrapper(`
    <div class="body">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:44px;margin-bottom:12px">🚚</div>
        <h1>طلبك في الطريق إليك!</h1>
        <p>مرحباً ${firstName}، تم شحن طلبك وهو في طريقه إليك</p>
      </div>

      <div class="order-box" style="text-align:center">
        <p style="color:#9C6B4E;font-size:12px;margin-bottom:4px">رقم الطلب</p>
        <p class="order-number">${orderNumber}</p>
      </div>

      <div class="tracking-box">
        <p style="color:#1E40AF;font-size:12px;margin-bottom:6px;font-weight:600">رقم التتبع</p>
        <p class="tracking-code">${trackingNumber}</p>
        ${carrier ? `<p style="color:#6B7280;font-size:12px;margin-top:6px">${carrier}</p>` : ''}
        ${trackingUrl ? `
          <div style="margin-top:14px">
            <a href="${trackingUrl}" class="btn btn-primary" style="background:#1E40AF">تتبع الشحنة الآن</a>
          </div>
        ` : ''}
      </div>

      <h2 style="margin-bottom:0">محتوى الشحنة</h2>
      ${previewItems}
      ${items?.length > 2 ? `<p style="color:#9C6B4E;font-size:12px;text-align:center;margin-top:8px">و${items.length-2} منتجات أخرى</p>` : ''}

      <div class="divider"></div>
      <p style="text-align:center;margin-bottom:16px">بانتظارك! إذا كان عندك أي سؤال، تواصل معنا عبر <a href="https://wa.me/905550044476" style="color:#7b192c;font-weight:700">واتساب</a></p>
    </div>
  `)
}

function buildCancellationEmail({ firstName, orderNumber, reason, items, pricing }) {
  const previewItems = (items || []).slice(0, 3).map(item => `
    <div class="item-row">
      ${item.image
        ? `<img src="${item.image}" alt="${item.name}" class="item-img"/>`
        : `<div class="item-img" style="display:flex;align-items:center;justify-content:center;font-size:20px">🫙</div>`
      }
      <div class="item-info">
        <p class="item-name">${item.name}</p>
        <p class="item-size">${item.size} × ${item.qty}</p>
      </div>
      <p class="item-price">€${(item.price * item.qty).toFixed(2)}</p>
    </div>
  `).join('')

  return emailWrapper(`
    <div class="body">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:44px;margin-bottom:12px">❌</div>
        <h1>تم إلغاء طلبك</h1>
        <p>مرحباً ${firstName}، نأسف لإبلاغك بأنه تم إلغاء طلبك</p>
      </div>

      <div class="order-box" style="text-align:center">
        <p style="color:#9C6B4E;font-size:12px;margin-bottom:4px">رقم الطلب الملغي</p>
        <p class="order-number" style="color:#DC2626">${orderNumber}</p>
      </div>

      ${reason ? `
        <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:14px 18px;margin:16px 0">
          <p style="color:#991B1B;font-size:13px;font-weight:700;margin-bottom:4px">سبب الإلغاء:</p>
          <p style="color:#DC2626;font-size:13px">${reason}</p>
        </div>
      ` : ''}

      <h2 style="margin-bottom:0">المنتجات الملغية</h2>
      ${previewItems}

      ${pricing ? `
      <div style="margin-top:12px">
        <div class="totals-row totals-total">
          <span>المبلغ الإجمالي</span>
          <span>€${pricing.total?.toFixed(2)}</span>
        </div>
      </div>` : ''}

      <div class="divider"></div>
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:14px 18px;margin-bottom:20px">
        <p style="color:#065F46;font-size:13px;font-weight:700;margin-bottom:4px">استرداد المبلغ</p>
        <p style="color:#16A34A;font-size:13px">إذا كنت قد دفعت مسبقاً، سيتم استرداد المبلغ خلال 3-5 أيام عمل.</p>
      </div>

      <div style="text-align:center">
        <p style="margin-bottom:16px">نتمنى نخدمك مرة ثانية!</p>
        <a href="${SITE}/products" class="btn btn-primary" style="margin-left:8px">تسوق مجدداً</a>
        <a href="https://wa.me/905550044476" class="btn btn-outline">تواصل معنا</a>
      </div>
    </div>
  `)
}

function buildAdminNewOrderEmail({ orderNumber, customer, items, pricing, payment, createdAt }) {
  const date = createdAt ? new Date(createdAt).toLocaleString('ar-SA') : new Date().toLocaleString('ar-SA')

  const itemsHtml = (items || []).map(item => `
    <div class="item-row">
      ${item.image
        ? `<img src="${item.image}" alt="${item.name}" class="item-img"/>`
        : `<div class="item-img" style="display:flex;align-items:center;justify-content:center;font-size:24px">🫙</div>`
      }
      <div class="item-info">
        <p class="item-name">${item.name}</p>
        <p class="item-size">${item.size} × ${item.qty}</p>
      </div>
      <p class="item-price">€${(item.price * item.qty).toFixed(2)}</p>
    </div>
  `).join('')

  return emailWrapper(`
    <div class="body">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:40px;margin-bottom:12px">🛍️</div>
        <h1>طلب جديد وصل!</h1>
        <p>${date}</p>
      </div>

      <div class="order-box" style="text-align:center">
        <p style="color:#9C6B4E;font-size:12px;margin-bottom:4px">رقم الطلب</p>
        <p class="order-number">${orderNumber}</p>
        <span class="badge badge-orange" style="margin-top:8px">${payment?.method || 'غير محدد'}</span>
      </div>

      <h2>بيانات الزبون</h2>
      <div>
        ${[
          ['الاسم',    `${customer.firstName} ${customer.lastName}`],
          ['الإيميل',  customer.email],
          ['الهاتف',   customer.phone   || '—'],
          ['العنوان',  customer.address || '—'],
          ['المدينة',  customer.city    || '—'],
          ['الدولة',   customer.country || '—'],
        ].map(([label, value]) => `
          <div class="info-row">
            <span class="info-label">${label}</span>
            <span class="info-value">${value}</span>
          </div>
        `).join('')}
      </div>

      <div class="divider"></div>

      <h2>تفاصيل الطلب</h2>
      ${itemsHtml}

      <div style="margin-top:16px">
        <div class="totals-row"><span>المجموع الفرعي</span><span>€${pricing.subtotal?.toFixed(2)}</span></div>
        <div class="totals-row"><span>الشحن</span><span>${pricing.shipping===0?'مجاني':'€'+pricing.shipping?.toFixed(2)}</span></div>
        ${pricing.discount>0?`<div class="totals-row"><span>الخصم</span><span style="color:#16A34A">-€${pricing.discount?.toFixed(2)}</span></div>`:''}
        <div class="totals-row totals-total"><span>الإجمالي</span><span>€${pricing.total?.toFixed(2)}</span></div>
      </div>

      <div class="divider"></div>
      <div style="text-align:center">
        <a href="https://aromena-spices.web.app/admin/orders" class="btn btn-primary">إدارة الطلبات</a>
      </div>
    </div>
  `)
}

// ═══════════════════════════════════════════
// CLOUD FUNCTIONS
// ═══════════════════════════════════════════

// 1️⃣ ترحيب بعد التسجيل
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
  if (!user.email) return
  const firstName = user.displayName?.split(' ')[0] || 'عزيزي العميل'
  await sendEmail({
    to: user.email,
    toName: user.displayName || firstName,
    subject: `أهلاً بك في أرومينا للبهارات! 🌶️`,
    html: buildWelcomeEmail({ firstName }),
  })
})

// 2️⃣ تأكيد الطلب للزبون + إشعار الأدمن
exports.onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap) => {
    const order = snap.data()
    if (!order?.customer?.email) return

    const firstName = order.customer.firstName || 'عزيزي العميل'

    // إيميل الزبون
    await sendEmail({
      to: order.customer.email,
      toName: `${order.customer.firstName} ${order.customer.lastName}`,
      subject: `تأكيد طلبك ${order.orderNumber} — أرومينا للبهارات`,
      html: buildOrderConfirmEmail({
        firstName,
        orderNumber: order.orderNumber,
        items:       order.items,
        pricing:     order.pricing,
        customer:    order.customer,
        payment:     order.payment,
        createdAt:   order.createdAt,
      }),
    })

    // إيميل الأدمن
    const config  = functions.config()
    const adminEmail = config.brevo?.sender_email || 'aromena.official@gmail.com'
    await sendEmail({
      to:      adminEmail,
      toName:  'Admin — Aromena',
      subject: `🛍️ طلب جديد ${order.orderNumber} من ${order.customer.firstName}`,
      html:    buildAdminNewOrderEmail({
        orderNumber: order.orderNumber,
        customer:    order.customer,
        items:       order.items,
        pricing:     order.pricing,
        payment:     order.payment,
        createdAt:   order.createdAt,
      }),
    })
  })

// 3️⃣ تحديث حالة الطلب
exports.onOrderStatusChanged = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change) => {
    const before = change.before.data()
    const after  = change.after.data()

    // تغير الحالة؟
    if (before.status === after.status && before.trackingNumber === after.trackingNumber) return
    if (!after?.customer?.email) return

    const firstName = after.customer.firstName || 'عزيزي العميل'

    // رابط التتبع أضيف؟
    if (after.trackingNumber && before.trackingNumber !== after.trackingNumber) {
      await sendEmail({
        to:      after.customer.email,
        toName:  `${after.customer.firstName} ${after.customer.lastName}`,
        subject: `شحنتك في الطريق! تتبع طلبك ${after.orderNumber} 🚚`,
        html:    buildTrackingEmail({
          firstName,
          orderNumber:    after.orderNumber,
          trackingNumber: after.trackingNumber,
          carrier:        after.carrier        || '',
          trackingUrl:    after.trackingUrl    || '',
          items:          after.items,
        }),
      })
      return
    }

    // إلغاء الطلب؟
    if (after.status === 'cancelled' && before.status !== 'cancelled') {
      await sendEmail({
        to:      after.customer.email,
        toName:  `${after.customer.firstName} ${after.customer.lastName}`,
        subject: `بخصوص طلبك ${after.orderNumber} — أرومينا للبهارات`,
        html:    buildCancellationEmail({
          firstName,
          orderNumber: after.orderNumber,
          reason:      after.cancelReason || '',
          items:       after.items,
          pricing:     after.pricing,
        }),
      })
      return
    }

    // تحديث عام للحالة
    const notifyStatuses = ['confirmed', 'processing', 'shipped', 'delivered']
    if (notifyStatuses.includes(after.status)) {
      await sendEmail({
        to:      after.customer.email,
        toName:  `${after.customer.firstName} ${after.customer.lastName}`,
        subject: `تحديث على طلبك ${after.orderNumber} — أرومينا للبهارات`,
        html:    buildStatusUpdateEmail({
          firstName,
          orderNumber: after.orderNumber,
          status:      after.status,
          items:       after.items,
          pricing:     after.pricing,
        }),
      })
    }
  })