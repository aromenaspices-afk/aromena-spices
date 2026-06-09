const ADMIN_EMAIL   = 'aromena.official@gmail.com'
const SITE          = 'https://aromena.com.tr'
const LOGO          = 'https://res.cloudinary.com/dvt0nntn7/image/upload/v1775408607/02_fwrhni.png'

// الإرسال عبر دالّة Netlify خادميّة (المفتاح لا يُكشَف في المتصفّح فلا يُعطَّل)
async function sendEmail({ to, toName, subject, html }) {
  try {
    const res = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, toName, subject, html }),
    })
    if (!res.ok) { console.error('❌ Email error:', res.status, await res.text()) }
    else { console.log('✅ Email sent to:', to) }
  } catch (err) { console.error('❌ Email failed:', err) }
}

function fmt(n) { return (n || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

function wrap(content) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#F5E6D3;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl}
.w{max-width:600px;margin:0 auto;padding:24px 16px}
.card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(123,25,44,.10)}
.hd{background:linear-gradient(135deg,#1a0610,#7b192c,#a82040);padding:28px 32px;text-align:center}
.hd img{width:200px;max-width:80%}
.bd{padding:28px}
.ft{background:#fdf0f2;padding:20px 32px;text-align:center;border-top:1px solid #f0d4d8}
.ft p{color:#9C6B4E;font-size:12px;line-height:1.8}
.ft a{color:#7b192c;text-decoration:none;font-weight:700}
h1{color:#3E1C00;font-size:22px;margin-bottom:8px;font-family:Georgia,serif}
h2{color:#3E1C00;font-size:15px;margin:18px 0 10px;border-bottom:2px solid #F5E6D3;padding-bottom:6px}
p{color:#6B3A2A;font-size:14px;line-height:1.8}
.box{background:linear-gradient(135deg,#fdf0f2,#fff5f0);border-radius:14px;padding:20px 24px;margin:16px 0;border:1px solid #f0d4d8;text-align:center;direction:rtl}
.num{color:#7b192c;font-size:22px;font-weight:900;letter-spacing:1px;font-family:monospace;direction:ltr;display:inline-block}
.div{height:1px;background:#F5E6D3;margin:20px 0}
.btn{display:inline-block;padding:13px 30px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;margin:4px}
.btn-p{background:linear-gradient(to left,#7b192c,#a82040);color:#f4be69;border:none}
.btn-o{background:#fff;color:#7b192c;border:2px solid #7b192c}
.row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #F5E6D3}
.img{width:54px;height:54px;border-radius:10px;object-fit:cover;flex-shrink:0;background:#fdf0f2}
.iname{color:#3E1C00;font-size:13px;font-weight:700;margin-bottom:3px}
.isize{color:#9C6B4E;font-size:11px}
.iprice{color:#7b192c;font-size:14px;font-weight:900;white-space:nowrap;margin-right:auto;margin-left:8px}
.trow{display:flex;justify-content:space-between;padding:6px 0;font-size:13px}
.trow span:first-child{color:#9C6B4E}
.trow span:last-child{color:#3E1C00;font-weight:600}
.ttotal{border-top:2px solid #E2C9A8;margin-top:8px;padding-top:10px}
.ttotal span:first-child{color:#3E1C00;font-size:15px;font-weight:700}
.ttotal span:last-child{color:#7b192c;font-size:20px;font-weight:900}
.irow{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #F5E6D3;font-size:13px}
.ilabel{color:#9C6B4E;min-width:100px}
.ivalue{color:#3E1C00;font-weight:600}
.track{background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:16px 20px;text-align:center;margin:16px 0}
.tcode{font-size:20px;font-weight:900;color:#1E40AF;letter-spacing:2px;font-family:monospace}
.badge{display:inline-block;padding:6px 18px;border-radius:50px;font-size:13px;font-weight:700}
.icon-circle{width:90px;height:auto;display:inline-block;margin-bottom:8px}
</style>
</head>
<body>
<div class="w">
<div class="card">
<div class="hd"><a href="${SITE}"><img src="${LOGO}" alt="Aromena Spices"/></a></div>
${content}
<div class="ft">
<p>Aromena Spices — بهارات أصيلة من قلب الشرق</p>
<p style="margin-top:6px">
<a href="${SITE}">الموقع</a> &nbsp;|&nbsp;
<a href="https://wa.me/905550044476">واتساب</a> &nbsp;|&nbsp;
<a href="https://www.instagram.com/aromena.official?igsh=eTU3bWcycmI3djRt">إنستغرام</a>
</p>
<p style="margin-top:8px;color:#C4956A;font-size:11px">Aromena Spices &copy; ${new Date().getFullYear()}</p>
</div>
</div>
</div>
</body>
</html>`
}

function itemsHtml(items = []) {
  return items.map(item => {
    const price = item.priceTRY || item.price || 0
    const total = fmt(price * (item.qty || 1))
    return `
    <table width="100%" style="padding:10px 0;border-bottom:1px solid #F5E6D3;direction:rtl;border-collapse:collapse">
      <tr>
        <td style="width:54px;vertical-align:middle;padding-left:12px">
          ${item.image
            ? `<img src="${item.image}" alt="" style="width:50px;height:50px;border-radius:10px;object-fit:cover;display:block"/>`
            : `<div style="width:50px;height:50px;border-radius:10px;background:#fdf0f2;display:flex;align-items:center;justify-content:center;font-size:20px">🌿</div>`}
        </td>
        <td style="vertical-align:middle;text-align:right;padding-right:4px">
          <p style="color:#3E1C00;font-size:13px;font-weight:700;margin:0 0 4px">${item.name || ''}</p>
          <p style="color:#9C6B4E;font-size:11px;margin:0">${item.size || ''} &times; ${item.qty || 1}</p>
        </td>
        <td style="vertical-align:middle;text-align:left;white-space:nowrap;padding-left:4px;direction:ltr">
          <p style="color:#7b192c;font-size:14px;font-weight:900;margin:0">&#8378;${total}</p>
        </td>
      </tr>
    </table>`
  }).join('')
}

function totalsHtml(pricing, pricingTRY) {
  const p = pricingTRY || pricing || {}
  return `
    <table width="100%" style="margin-top:16px;background:#FFFBF5;border-radius:10px;padding:14px;border:1px solid #E2C9A8;border-collapse:collapse;direction:rtl">
      <tr>
        <td style="padding:7px 14px;color:#9C6B4E;font-size:13px;text-align:right">المجموع الفرعي</td>
        <td style="padding:7px 14px;color:#3E1C00;font-size:13px;font-weight:600;text-align:left;direction:ltr">&#8378;${fmt(p.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:7px 14px;color:#9C6B4E;font-size:13px;text-align:right">الشحن</td>
        <td style="padding:7px 14px;font-size:13px;font-weight:600;text-align:left;direction:ltr;color:${(p.shipping||0)===0?'#16A34A':'#3E1C00'}">${(p.shipping||0)===0?'مجاني ✓':'&#8378;'+fmt(p.shipping)}</td>
      </tr>
      ${(p.discount||0)>0?`<tr>
        <td style="padding:7px 14px;color:#9C6B4E;font-size:13px;text-align:right">الخصم</td>
        <td style="padding:7px 14px;color:#16A34A;font-size:13px;font-weight:600;text-align:left;direction:ltr">-&#8378;${fmt(p.discount)}</td>
      </tr>`:''}
      <tr style="border-top:2px solid #E2C9A8">
        <td style="padding:10px 14px;color:#3E1C00;font-size:15px;font-weight:700;text-align:right">الإجمالي</td>
        <td style="padding:10px 14px;color:#7b192c;font-size:18px;font-weight:900;text-align:left;direction:ltr">&#8378;${fmt(p.total)}</td>
      </tr>
    </table>`
}

function customerInfoHtml(c) {
  return [
    ['الاسم',   `${c.firstName||''} ${c.lastName||''}`],
    ['الإيميل', c.email   || '—'],
    ['الهاتف',  c.phone   || '—'],
    ['العنوان', c.address || '—'],
    ['المدينة', c.city    || '—'],
    ['الدولة',  c.country || '—'],
  ].map(([label, value]) => `
    <table width="100%" style="border-collapse:collapse;border-bottom:1px solid #F5E6D3;direction:rtl">
      <tr>
        <td style="padding:8px 14px;color:#9C6B4E;font-size:12px;text-align:right;width:100px">${label}</td>
        <td style="padding:8px 14px;color:#3E1C00;font-size:13px;font-weight:600;text-align:right">${value}</td>
      </tr>
    </table>`).join('')
}

const icons = {
  check: `<img src="https://res.cloudinary.com/dvt0nntn7/image/upload/v1775408607/02_fwrhni.png" style="width:80px;height:auto;margin-bottom:8px" alt="Aromena"/>`,
  box:   `<span style="font-size:36px;line-height:1">📦</span>`,
  truck: `<span style="font-size:36px;line-height:1">🚚</span>`,
  lock:  `<span style="font-size:36px;line-height:1">🔐</span>`,
  x:     `<span style="font-size:36px;line-height:1">❌</span>`,
  star:  `<span style="font-size:36px;line-height:1">⭐</span>`,
}

// ═══ 1 — ترحيب ═══
export async function sendWelcomeEmail({ email, displayName }) {
  const firstName = displayName?.split(' ')[0] || 'عزيزي العميل'
  await sendEmail({
    to: email, toName: displayName,
    subject: `مرحباً بك في Aromena Spices`,
    html: wrap(`
      <div class="bd">
        <div style="text-align:center;margin-bottom:24px">
          <div style="text-align:center;margin-bottom:8px">${icons.star}</div>
          <h1>أهلاً وسهلاً ${firstName}</h1>
          <p style="margin-top:8px">يسعدنا انضمامك لعائلة Aromena Spices</p>
        </div>
        <div class="box">
          <p style="color:#7b192c;font-size:13px;margin-bottom:14px">اكتشف تشكيلتنا الفاخرة من البهارات الأصيلة</p>
          <a href="${SITE}/products" class="btn btn-p">تسوّق الآن</a>
          <a href="${SITE}/packages" class="btn btn-o">الباقات</a>
        </div>
      </div>
    `),
  })
}

// ═══ 2 — تأكيد الطلب للزبون ═══
export async function sendOrderConfirmEmail({ customer, orderNumber, items, pricing, pricingTRY, payment, createdAt }) {
  if (!customer?.email) return
  const firstName = customer.firstName || 'عزيزي العميل'
  const date = createdAt ? new Date(createdAt).toLocaleDateString('ar-SA', { year:'numeric', month:'long', day:'numeric' }) : ''
  await sendEmail({
    to: customer.email, toName: `${customer.firstName} ${customer.lastName}`,
    subject: `تم استلام طلبك ${orderNumber} — Aromena Spices`,
    html: wrap(`
      <div class="bd">
        <div style="text-align:center;margin-bottom:20px">
          <div style="text-align:center;margin-bottom:8px">${icons.check}</div>
          <h1>تم استلام طلبك</h1>
          <p>شكراً ${firstName}، طلبك وصلنا وجاري المراجعة</p>
        </div>
        <div class="box">
          <p style="color:#9C6B4E;font-size:12px;margin-bottom:6px">رقم الطلب</p>
          <p class="num">${orderNumber}</p>
          <p style="color:#9C6B4E;font-size:12px;margin-top:6px">${date}</p>
        </div>
        <div style="background:linear-gradient(135deg,#fdf0f2,#fff8f5);border-radius:12px;padding:16px 20px;margin:16px 0;border:1px solid #f0d4d8;text-align:center;direction:rtl">
          <p style="color:#7b192c;font-size:14px;font-weight:700;margin-bottom:6px">شكراً لثقتك بأرومينا 🌿</p>
          <p style="color:#9C6B4E;font-size:13px;line-height:1.8">طلبك وصلنا وقيد المراجعة — سنتواصل معك قريباً لتأكيد التحويل البنكي وتفاصيل الشحن.</p>
        </div>
        <h2>تفاصيل الطلب</h2>
        ${itemsHtml(items)}
        ${totalsHtml(pricing, pricingTRY)}
        <div class="div"></div>
        <h2>بيانات الشحن</h2>
        ${customerInfoHtml(customer)}
        <div class="irow">
          <span class="ilabel">طريقة الدفع</span>
          <span class="ivalue">${payment?.method === 'transfer' ? 'تحويل بنكي' : payment?.method || '—'}</span>
        </div>
        <div class="div"></div>
        <div style="text-align:center">
          <p style="margin-bottom:16px">سنتواصل معك قريباً لتأكيد الدفع وتفاصيل الشحن</p>
          <a href="${SITE}/account" class="btn btn-p">متابعة طلبي</a>
        </div>
      </div>
    `),
  })
}

// ═══ 3 — إشعار الأدمن بطلب جديد ═══
export async function sendAdminNewOrderEmail({ orderNumber, customer, items, pricing, pricingTRY, payment, createdAt }) {
  const date = createdAt ? new Date(createdAt).toLocaleString('ar-SA') : ''
  await sendEmail({
    to: ADMIN_EMAIL, toName: 'Admin — Aromena',
    subject: `طلب جديد ${orderNumber} من ${customer.firstName}`,
    html: wrap(`
      <div class="bd">
        <div style="text-align:center;margin-bottom:20px">
          <div style="text-align:center;margin-bottom:8px">${icons.box}</div>
          <h1>طلب جديد</h1>
          <p>${date}</p>
        </div>
        <div class="box">
          <p style="color:#9C6B4E;font-size:12px;margin-bottom:4px">رقم الطلب</p>
          <p class="num">${orderNumber}</p>
          <span class="badge" style="background:#FEF3C7;color:#92400E;margin-top:8px;display:inline-block">
            ${payment?.method === 'transfer' ? 'تحويل بنكي' : payment?.method || 'غير محدد'}
          </span>
        </div>
        <h2>بيانات الزبون</h2>
        ${customerInfoHtml(customer)}
        <div class="div"></div>
        <h2>تفاصيل الطلب</h2>
        ${itemsHtml(items)}
        ${totalsHtml(pricing, pricingTRY)}
        <div class="div"></div>
        <div style="text-align:center">
          <a href="${SITE}/admin/orders" class="btn btn-p">إدارة الطلبات</a>
        </div>
      </div>
    `),
  })
}

// ═══ 4 — تحديث حالة الطلب ═══
export async function sendStatusUpdateEmail({ customer, orderNumber, status, items, pricing, pricingTRY }) {
  if (!customer?.email) return
  const firstName = customer.firstName || 'عزيزي العميل'
  const statusMap = {
    confirmed:  { label:'تم تأكيد طلبك ✓', svg: icons.check, bg:'#D1FAE5', color:'#065F46' },
    processing: { label:'جاري تجهيز طلبك', svg: icons.box,   bg:'#DBEAFE', color:'#1E40AF' },
    shipped:    { label:'طلبك في الطريق',   svg: icons.truck, bg:'#D1FAE5', color:'#065F46' },
    delivered:  { label:'تم تسليم طلبك',   svg: icons.check, bg:'#D1FAE5', color:'#065F46' },
  }
  const st = statusMap[status] || { label: status, svg: icons.box, bg:'#FEF3C7', color:'#92400E' }
  await sendEmail({
    to: customer.email, toName: `${customer.firstName} ${customer.lastName}`,
    subject: `${st.label} — ${orderNumber}`,
    html: wrap(`
      <div class="bd">
        <div style="text-align:center;margin-bottom:24px">
          <div style="text-align:center;margin-bottom:8px">${st.svg}</div>
          <h1>${st.label}</h1>
          <p>مرحباً ${firstName}</p>
        </div>
        <div class="box">
          <p style="color:#9C6B4E;font-size:12px;margin-bottom:4px">رقم الطلب</p>
          <p class="num">${orderNumber}</p>
        </div>
        <h2>محتوى الطلب</h2>
        ${itemsHtml(items)}
        ${pricing ? totalsHtml(pricing, pricingTRY) : ''}
        <div class="div"></div>
        <div style="text-align:center">
          <a href="${SITE}/account" class="btn btn-p">عرض تفاصيل الطلب</a>
        </div>
      </div>
    `),
  })
}

// ═══ 5 — رابط التتبع ═══
export async function sendTrackingEmail({ customer, orderNumber, trackingNumber, carrier, trackingUrl, items }) {
  if (!customer?.email) return
  const firstName = customer.firstName || 'عزيزي العميل'
  await sendEmail({
    to: customer.email, toName: `${customer.firstName} ${customer.lastName}`,
    subject: `طلبك في الطريق إليك — ${orderNumber}`,
    html: wrap(`
      <div class="bd">
        <div style="text-align:center;margin-bottom:20px">
          <div style="text-align:center;margin-bottom:8px">${icons.truck}</div>
          <h1>طلبك في الطريق</h1>
          <p>مرحباً ${firstName}، تم شحن طلبك وهو في طريقه إليك</p>
        </div>
        <div class="box">
          <p style="color:#9C6B4E;font-size:12px;margin-bottom:4px">رقم الطلب</p>
          <p class="num">${orderNumber}</p>
        </div>
        <div class="track">
          <p style="color:#1E40AF;font-size:12px;margin-bottom:6px;font-weight:700">رقم التتبع</p>
          <p class="tcode">${trackingNumber}</p>
          ${carrier?`<p style="color:#6B7280;font-size:12px;margin-top:6px">${carrier}</p>`:''}
          ${trackingUrl?`<div style="margin-top:14px"><a href="${trackingUrl}" class="btn" style="background:#1E40AF;color:#fff">تتبع الشحنة</a></div>`:''}
        </div>
        <h2>محتوى الشحنة</h2>
        ${itemsHtml((items||[]).slice(0,3))}
        <div class="div"></div>
        <p style="text-align:center">أي سؤال؟ <a href="https://wa.me/905550044476" style="color:#7b192c;font-weight:700">واتساب</a></p>
      </div>
    `),
  })
}

// ═══ 6 — إلغاء الطلب ═══
export async function sendCancellationEmail({ customer, orderNumber, reason, items, pricing, pricingTRY }) {
  if (!customer?.email) return
  const firstName = customer.firstName || 'عزيزي العميل'
  await sendEmail({
    to: customer.email, toName: `${customer.firstName} ${customer.lastName}`,
    subject: `بخصوص طلبك ${orderNumber} — Aromena Spices`,
    html: wrap(`
      <div class="bd">
        <div style="text-align:center;margin-bottom:20px">
          <div style="text-align:center;margin-bottom:8px">${icons.x}</div>
          <h1>تم إلغاء طلبك</h1>
          <p>مرحباً ${firstName}، نأسف لإبلاغك بإلغاء طلبك</p>
        </div>
        <div class="box">
          <p style="color:#9C6B4E;font-size:12px;margin-bottom:4px">رقم الطلب الملغي</p>
          <p class="num" style="color:#DC2626">${orderNumber}</p>
        </div>
        ${reason?`<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:14px 18px;margin:16px 0">
          <p style="color:#991B1B;font-size:13px;font-weight:700;margin-bottom:4px">سبب الإلغاء</p>
          <p style="color:#DC2626;font-size:13px">${reason}</p>
        </div>`:''}
        <h2>المنتجات الملغية</h2>
        ${itemsHtml(items)}
        ${pricing?totalsHtml(pricing, pricingTRY):''}
        <div class="div"></div>
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:14px 18px;margin-bottom:20px">
          <p style="color:#065F46;font-size:13px;font-weight:700;margin-bottom:4px">استرداد المبلغ</p>
          <p style="color:#16A34A;font-size:13px">إذا كنت قد دفعت مسبقاً، سيتم استرداد المبلغ خلال 3-5 أيام عمل.</p>
        </div>
        <div style="text-align:center">
          <a href="${SITE}/products" class="btn btn-p">تسوق مجدداً</a>
          <a href="https://wa.me/905550044476" class="btn btn-o">تواصل معنا</a>
        </div>
      </div>
    `),
  })
}

// ═══ 7 — استعادة كلمة المرور ═══
export async function sendPasswordResetEmail({ email, resetUrl }) {
  await sendEmail({
    to: email, toName: email,
    subject: `استعادة كلمة المرور — Aromena Spices`,
    html: wrap(`
      <div class="bd">
        <div style="text-align:center;margin-bottom:28px">
          <div style="text-align:center;margin-bottom:8px">${icons.lock}</div>
          <h1>استعادة كلمة المرور</h1>
          <p>تلقينا طلباً لإعادة تعيين كلمة مرور حسابك</p>
        </div>
        <div class="box">
          <p style="color:#9C6B4E;font-size:13px;margin-bottom:6px">البريد الإلكتروني</p>
          <p style="color:#3E1C00;font-weight:700;margin-bottom:20px">${email}</p>
          <p style="color:#6B3A2A;font-size:13px;margin-bottom:20px;line-height:1.7">
            اضغط على الزر أدناه لإعادة تعيين كلمة مرورك.<br/>
            صلاحية هذا الرابط <strong>ساعة واحدة</strong> فقط.
          </p>
          <a href="${resetUrl}" class="btn btn-p" style="font-size:16px;padding:16px 40px">إعادة تعيين كلمة المرور</a>
        </div>
        <div class="div"></div>
        <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:12px;padding:14px 18px">
          <p style="color:#92400E;font-size:13px;font-weight:700;margin-bottom:4px">تنبيه أمني</p>
          <p style="color:#B45309;font-size:12px;line-height:1.7">إذا لم تطلب إعادة التعيين، تجاهل هذا الإيميل. حسابك بأمان.</p>
        </div>
      </div>
    `),
  })
}