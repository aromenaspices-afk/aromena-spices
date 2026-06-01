import { useState, useEffect, useRef } from 'react'
import { db } from '../../firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { FiUsers, FiMail, FiPlus, FiTrash2, FiSend, FiCheck, FiX, FiUpload, FiFilter, FiGlobe, FiShoppingBag, FiEye, FiCode } from 'react-icons/fi'
import toast from 'react-hot-toast'

const BORDEAUX = '#7b192c'
const GOLD     = '#f4be69'
const BG       = '#F5E6D3'
const BG2      = '#EDD9C0'
const CARD     = '#ffffff'
const TEXT     = '#3E1C00'
const TEXT2    = '#9C6B4E'
const BORDER   = '#E2C9A8'

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY
const SENDER_EMAIL  = import.meta.env.VITE_SENDER_EMAIL || 'services.online.yahya@gmail.com'
const SENDER_NAME   = 'Aromena Spices'
const SITE          = 'https://aromina.com.tr'
const LOGO          = 'https://res.cloudinary.com/dvt0nntn7/image/upload/v1773706292/%D8%AF%D9%88%D9%86_%D8%B9%D9%86%D9%88%D8%A7%D9%86_1000_x_300_%D8%A8%D9%8A%D9%83%D8%B3%D9%84_yjbttl.png'

// ═══════════════════════════════════
// قوالب النيوز ليتر
// ═══════════════════════════════════
const TEMPLATES = [
  {
    id: 'offer',
    label: 'عرض خاص / تخفيضات',
    icon: '🎁',
    color: '#DC2626',
    fields: ['title_ar', 'subtitle_ar', 'discount', 'code', 'expiry', 'cta'],
    defaults: { title_ar: 'عرض خاص لك!', subtitle_ar: 'لا تفوّت هذا العرض المميز', discount: '20%', code: 'AROMENA20', expiry: '', cta: 'تسوق الآن' },
  },
  {
    id: 'new_product',
    label: 'إطلاق منتج جديد',
    icon: '🌶️',
    color: '#D97706',
    fields: ['title_ar', 'product_name', 'product_desc', 'cta'],
    defaults: { title_ar: 'منتج جديد وصل!', product_name: '', product_desc: '', cta: 'اكتشف الآن' },
  },
  {
    id: 'welcome',
    label: 'رسالة ترحيبية دورية',
    icon: '👋',
    color: '#16A34A',
    fields: ['title_ar', 'body_ar', 'cta'],
    defaults: { title_ar: 'أهلاً بكم في أرومينا!', body_ar: 'شكراً لثقتكم بنا — نحن نقدم أجود البهارات الأصيلة', cta: 'تسوق الآن' },
  },
  {
    id: 'news',
    label: 'خبر / تحديث عام',
    icon: '📢',
    color: '#2563EB',
    fields: ['title_ar', 'body_ar', 'cta'],
    defaults: { title_ar: 'تحديث جديد من أرومينا', body_ar: '', cta: 'اقرأ أكثر' },
  },
  {
    id: 'gift',
    label: 'بطاقة هدية موسمية',
    icon: '🎄',
    color: '#7C3AED',
    fields: ['title_ar', 'season', 'body_ar', 'cta'],
    defaults: { title_ar: 'هدية موسمية مميزة', season: 'رمضان المبارك', body_ar: 'أهدِ من تحب طعم الأصالة', cta: 'اختر هديتك' },
  },
]

// ═══════════════════════════════════
// بناء HTML القالب
// ═══════════════════════════════════
function buildEmailHtml(template, fields) {
  const wrap = (content) => `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#F5E6D3;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl}
.w{max-width:600px;margin:0 auto;padding:24px 16px}
.card{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(123,25,44,.10)}
.hd{background:linear-gradient(135deg,#7b192c,#a82040);padding:28px 32px;text-align:center}
.hd img{width:200px;max-width:80%}
.bd{padding:32px}
.ft{background:#fdf0f2;padding:20px 32px;text-align:center;border-top:1px solid #f0d4d8}
.ft p{color:#9C6B4E;font-size:12px;line-height:1.8}
.ft a{color:#7b192c;text-decoration:none;font-weight:700}
h1{color:#3E1C00;font-size:22px;margin-bottom:8px}
p{color:#6B3A2A;font-size:14px;line-height:1.8}
.btn{display:inline-block;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;background:linear-gradient(to left,#7b192c,#a82040);color:#f4be69}
.div{height:1px;background:#F5E6D3;margin:20px 0}
.unsubscribe{color:#C4956A;font-size:11px;margin-top:8px}
.unsubscribe a{color:#C4956A}
</style></head>
<body><div class="w"><div class="card">
<div class="hd"><a href="${SITE}"><img src="${LOGO}" alt="Aromena Spices"/></a></div>
${content}
<div class="ft">
<p>أرومينا للبهارات — بهارات أصيلة من قلب الشرق</p>
<p style="margin-top:6px"><a href="${SITE}">الموقع</a> &nbsp;|&nbsp; <a href="https://wa.me/905550044476">واتساب</a> &nbsp;|&nbsp; <a href="https://www.instagram.com/aromena.official?igsh=eTU3bWcycmI3djRt">إنستغرام</a></p>
<p class="unsubscribe">Aromena Spices © ${new Date().getFullYear()} — <a href="${SITE}">إلغاء الاشتراك</a></p>
</div></div></div></body></html>`

  if (template.id === 'offer') return wrap(`
    <div class="bd">
      <div style="text-align:center;margin-bottom:24px">
        <div style="background:linear-gradient(135deg,#DC2626,#B91C1C);border-radius:16px;padding:20px;display:inline-block;margin-bottom:16px">
          <span style="font-size:48px">🎁</span>
        </div>
        <h1>${fields.title_ar}</h1>
        <p style="font-size:15px;margin-top:8px">${fields.subtitle_ar}</p>
      </div>
      <div style="background:linear-gradient(135deg,#fdf0f2,#fce4e8);border-radius:16px;padding:24px;text-align:center;margin:20px 0;border:2px dashed #7b192c">
        <p style="color:#9C6B4E;font-size:13px;margin-bottom:8px">خصم حصري</p>
        <p style="color:#7b192c;font-size:48px;font-weight:900;line-height:1">${fields.discount}</p>
        <div style="background:#7b192c;border-radius:10px;padding:10px 20px;display:inline-block;margin-top:14px">
          <p style="color:#f4be69;font-size:18px;font-weight:900;letter-spacing:3px;font-family:monospace">${fields.code}</p>
        </div>
        ${fields.expiry ? `<p style="color:#9C6B4E;font-size:12px;margin-top:10px">ينتهي: ${fields.expiry}</p>` : ''}
      </div>
      <div class="div"></div>
      <div style="text-align:center"><a href="${SITE}/products" class="btn">${fields.cta}</a></div>
    </div>`)

  if (template.id === 'new_product') return wrap(`
    <div class="bd">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:52px;margin-bottom:16px">🌶️</div>
        <h1>${fields.title_ar}</h1>
      </div>
      <div style="background:#fdf0f2;border-radius:16px;padding:24px;margin:20px 0">
        <h2 style="color:#7b192c;font-size:20px;margin-bottom:10px">${fields.product_name}</h2>
        <p style="font-size:15px;line-height:1.9">${fields.product_desc}</p>
      </div>
      <div class="div"></div>
      <div style="text-align:center"><a href="${SITE}/products" class="btn">${fields.cta}</a></div>
    </div>`)

  if (template.id === 'welcome') return wrap(`
    <div class="bd">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:52px;margin-bottom:16px">👋</div>
        <h1>${fields.title_ar}</h1>
      </div>
      <p style="font-size:15px;line-height:1.9;text-align:center;margin-bottom:24px">${fields.body_ar}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0">
        ${[['🌿','100% طبيعي'],['🚚','شحن سريع'],['🎁','باقات هدايا'],['⭐','جودة مضمونة']].map(([icon,label])=>`
          <div style="background:#fdf0f2;border-radius:12px;padding:14px;text-align:center">
            <div style="font-size:24px;margin-bottom:6px">${icon}</div>
            <p style="color:#7b192c;font-weight:700;font-size:13px">${label}</p>
          </div>`).join('')}
      </div>
      <div class="div"></div>
      <div style="text-align:center"><a href="${SITE}/products" class="btn">${fields.cta}</a></div>
    </div>`)

  if (template.id === 'news') return wrap(`
    <div class="bd">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:52px;margin-bottom:16px">📢</div>
        <h1>${fields.title_ar}</h1>
      </div>
      <p style="font-size:15px;line-height:1.9;margin-bottom:24px">${fields.body_ar}</p>
      <div class="div"></div>
      <div style="text-align:center"><a href="${SITE}" class="btn">${fields.cta}</a></div>
    </div>`)

  if (template.id === 'gift') return wrap(`
    <div class="bd">
      <div style="text-align:center;background:linear-gradient(135deg,#4C1D95,#6D28D9);border-radius:16px;padding:28px;margin-bottom:24px">
        <div style="font-size:52px;margin-bottom:12px">🎄</div>
        <h1 style="color:#fff">${fields.title_ar}</h1>
        <p style="color:rgba(255,255,255,0.8);font-size:15px;margin-top:8px">${fields.season}</p>
      </div>
      <p style="font-size:15px;line-height:1.9;text-align:center;margin-bottom:24px">${fields.body_ar}</p>
      <div class="div"></div>
      <div style="text-align:center"><a href="${SITE}/packages" class="btn">${fields.cta}</a></div>
    </div>`)

  return wrap(`<div class="bd"><h1>${fields.title_ar}</h1></div>`)
}

// ═══════════════════════════════════
// إرسال عبر Brevo
// ═══════════════════════════════════
async function sendNewsletterEmail({ to, toName, subject, html }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to, name: toName || to }],
      subject,
      htmlContent: html,
    }),
  })
  if (!res.ok) throw new Error(await res.text())
}

export default function Newsletter() {
  const [customers,      setCustomers]      = useState([])
  const [orders,         setOrders]         = useState([])
  const [loading,        setLoading]        = useState(true)
  const [subscribers,    setSubscribers]    = useState([])
  const [selected,       setSelected]       = useState(new Set())
  const [filterCountry,  setFilterCountry]  = useState('الكل')
  const [filterOrders,   setFilterOrders]   = useState('الكل')
  const [search,         setSearch]         = useState('')
  const [newEmail,       setNewEmail]       = useState('')
  const [newName,        setNewName]        = useState('')
  const [activeTemplate, setActiveTemplate] = useState(null)
  const [templateFields, setTemplateFields] = useState({})
  const [subject,        setSubject]        = useState('')
  const [sending,        setSending]        = useState(false)
  const [sendProgress,   setSendProgress]   = useState(0)
  const [preview,        setPreview]        = useState(false)
  const [tab,            setTab]            = useState('list') // 'list' | 'compose' | 'custom'
  const [customHtml,     setCustomHtml]     = useState('')
  const [customSubject,  setCustomSubject]  = useState('')
  const [customPreview,  setCustomPreview]  = useState(false)
  const csvRef = useRef(null)

  // جلب الزبائن والطلبات
  useEffect(() => {
    const unsub1 = onSnapshot(
      query(collection(db, 'users'), orderBy('createdAt', 'desc')),
      snap => { setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false) }
    )
    const unsub2 = onSnapshot(collection(db, 'orders'), snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => { unsub1(); unsub2() }
  }, [])

  // بناء قائمة المشتركين من الزبائن تلقائياً
  useEffect(() => {
    const fromCustomers = customers
      .filter(c => c.email)
      .map(c => ({
        id:      c.id,
        email:   c.email,
        name:    `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
        country: c.country || '—',
        orders:  orders.filter(o => o.customer?.uid === c.id).length,
        source:  'customer',
      }))
    setSubscribers(prev => {
      const manual = prev.filter(s => s.source === 'manual')
      const merged = [...fromCustomers]
      manual.forEach(m => { if (!merged.find(s => s.email === m.email)) merged.push(m) })
      return merged
    })
  }, [customers, orders])

  // فلترة
  const countries = ['الكل', ...new Set(subscribers.map(s => s.country).filter(c => c && c !== '—'))]
  const filtered = subscribers.filter(s => {
    const matchSearch  = s.email.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase())
    const matchCountry = filterCountry === 'الكل' || s.country === filterCountry
    const matchOrders  = filterOrders === 'الكل'
      || (filterOrders === 'لديهم طلبات' && s.orders > 0)
      || (filterOrders === 'بدون طلبات'  && s.orders === 0)
    return matchSearch && matchCountry && matchOrders
  })

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(s => s.id)))
  }

  function addManual() {
    if (!newEmail.trim()) return
    if (subscribers.find(s => s.email === newEmail.trim())) {
      toast.error('الإيميل موجود مسبقاً')
      return
    }
    const newSub = {
      id:      `manual_${Date.now()}`,
      email:   newEmail.trim(),
      name:    newName.trim() || newEmail.trim(),
      country: '—',
      orders:  0,
      source:  'manual',
    }
    setSubscribers(prev => [newSub, ...prev])
    setNewEmail('')
    setNewName('')
    toast.success('تمت الإضافة!')
  }

  function removeSubscriber(id) {
    setSubscribers(prev => prev.filter(s => s.id !== id))
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next })
  }

  function importCSV(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').filter(Boolean)
      let added = 0
      lines.forEach(line => {
        const [email, name] = line.split(',').map(s => s.trim().replace(/"/g, ''))
        if (!email || !email.includes('@')) return
        if (subscribers.find(s => s.email === email)) return
        setSubscribers(prev => [...prev, {
          id: `csv_${Date.now()}_${added}`,
          email, name: name || email,
          country: '—', orders: 0, source: 'manual',
        }])
        added++
      })
      toast.success(`تم استيراد ${added} إيميل`)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function selectTemplate(tmpl) {
    setActiveTemplate(tmpl)
    setTemplateFields(tmpl.defaults)
    setSubject(tmpl.defaults.title_ar + ' — أرومينا للبهارات')
    setPreview(false)
  }

  async function handleSend() {
    if (!activeTemplate) { toast.error('اختر قالباً أولاً'); return }
    if (!subject.trim()) { toast.error('العنوان مطلوب'); return }
    const targets = filtered.filter(s => selected.size === 0 || selected.has(s.id))
    if (targets.length === 0) { toast.error('لا يوجد مشتركين للإرسال'); return }
    if (!confirm(`إرسال لـ ${targets.length} مشترك؟`)) return

    setSending(true)
    setSendProgress(0)
    let success = 0
    const html = buildEmailHtml(activeTemplate, templateFields)

    for (let i = 0; i < targets.length; i++) {
      try {
        await sendNewsletterEmail({ to: targets[i].email, toName: targets[i].name, subject, html })
        success++
      } catch (err) {
        console.error(`Failed to send to ${targets[i].email}:`, err)
      }
      setSendProgress(Math.round(((i + 1) / targets.length) * 100))
      // تأخير بسيط لتجنب rate limit
      if (i < targets.length - 1) await new Promise(r => setTimeout(r, 200))
    }

    setSending(false)
    setSendProgress(0)
    toast.success(`تم الإرسال لـ ${success} من ${targets.length} مشترك! 📧`)
  }

  const inputStyle = {
    padding: '9px 12px', borderRadius: 10, border: `2px solid ${BORDER}`,
    fontSize: '0.85rem', color: TEXT, fontFamily: 'Amiri, serif',
    outline: 'none', background: '#FFFBF5', transition: 'border-color 0.15s',
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: TEXT2 }}>جاري التحميل...</div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', color: TEXT, fontFamily: 'Amiri, serif' }}>النيوز ليتر</h1>
          <p style={{ color: TEXT2, fontSize: '0.85rem' }}>{subscribers.length} مشترك</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('list')} style={{
            padding: '9px 18px', borderRadius: 50, border: '2px solid',
            borderColor: tab === 'list' ? BORDEAUX : BORDER,
            background: tab === 'list' ? `linear-gradient(to left,${BORDEAUX},#a82040)` : CARD,
            color: tab === 'list' ? GOLD : '#6B3A2A',
            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Amiri, serif',
          }}>
            <FiUsers size={14} style={{ marginLeft: 5 }} /> المشتركون
          </button>
          <button onClick={() => setTab('compose')} style={{
            padding: '9px 18px', borderRadius: 50, border: '2px solid',
            borderColor: tab === 'compose' ? BORDEAUX : BORDER,
            background: tab === 'compose' ? `linear-gradient(to left,${BORDEAUX},#a82040)` : CARD,
            color: tab === 'compose' ? GOLD : '#6B3A2A',
            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Amiri, serif',
          }}>
            <FiMail size={14} style={{ marginLeft: 5 }} /> إنشاء حملة
          </button>
          <button onClick={() => setTab('custom')} style={{
            padding: '9px 18px', borderRadius: 50, border: '2px solid',
            borderColor: tab === 'custom' ? BORDEAUX : BORDER,
            background: tab === 'custom' ? `linear-gradient(to left,${BORDEAUX},#a82040)` : CARD,
            color: tab === 'custom' ? GOLD : '#6B3A2A',
            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Amiri, serif',
          }}>
            <FiCode size={14} style={{ marginLeft: 5 }} /> HTML مخصص
          </button>
        </div>
      </div>

      {/* ══════════ تاب المشتركون ══════════ */}
      {tab === 'list' && (
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'إجمالي المشتركين', value: subscribers.length,                                         color: BORDEAUX,   bg: '#fdf0f2' },
              { label: 'لديهم طلبات',       value: subscribers.filter(s => s.orders > 0).length,             color: '#16A34A',  bg: '#F0FDF4' },
              { label: 'بدون طلبات',        value: subscribers.filter(s => s.orders === 0).length,           color: '#D97706',  bg: '#FEF3C7' },
              { label: 'محددون للإرسال',    value: selected.size || filtered.length,                         color: '#2563EB',  bg: '#EFF6FF' },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: 14, padding: '14px 16px', textAlign: 'center', border: `1px solid ${s.color}22` }}>
                <p style={{ color: s.color, fontWeight: 900, fontSize: '1.5rem', lineHeight: 1 }}>{s.value}</p>
                <p style={{ color: s.color, fontSize: '0.72rem', marginTop: 4, fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* إضافة يدوية + استيراد CSV */}
          <div style={{ background: CARD, borderRadius: 16, padding: '16px 18px', border: `1px solid ${BORDER}`, marginBottom: 16 }}>
            <p style={{ color: TEXT, fontWeight: 700, fontSize: '0.88rem', marginBottom: 12 }}>إضافة مشترك جديد</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="الاسم (اختياري)"
                style={{ ...inputStyle, flex: 1, minWidth: 120 }}
                onFocus={e => e.target.style.borderColor = BORDEAUX}
                onBlur={e => e.target.style.borderColor = BORDER} />
              <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="الإيميل *" type="email"
                style={{ ...inputStyle, flex: 2, minWidth: 180 }}
                onFocus={e => e.target.style.borderColor = BORDEAUX}
                onBlur={e => e.target.style.borderColor = BORDER}
                onKeyDown={e => e.key === 'Enter' && addManual()} />
              <button onClick={addManual} style={{
                background: `linear-gradient(to left,${BORDEAUX},#a82040)`, color: GOLD,
                padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.85rem', fontFamily: 'Amiri, serif',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <FiPlus size={14} /> إضافة
              </button>
              <button onClick={() => csvRef.current?.click()} style={{
                background: BG, border: `2px solid ${BORDER}`, color: TEXT2,
                padding: '9px 14px', borderRadius: 10, cursor: 'pointer',
                fontWeight: 600, fontSize: '0.82rem', fontFamily: 'Amiri, serif',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <FiUpload size={14} /> استيراد CSV
              </button>
              <input ref={csvRef} type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={importCSV} />
            </div>
            <p style={{ color: TEXT2, fontSize: '0.72rem', marginTop: 8 }}>
              صيغة CSV: email,name (سطر لكل مشترك)
            </p>
          </div>

          {/* فلاتر */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث بالاسم أو الإيميل..."
                style={{ ...inputStyle, width: '100%', paddingRight: 36, boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = BORDEAUX}
                onBlur={e => e.target.style.borderColor = BORDER} />
            </div>
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
              style={{ ...inputStyle }}>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterOrders} onChange={e => setFilterOrders(e.target.value)}
              style={{ ...inputStyle }}>
              {['الكل', 'لديهم طلبات', 'بدون طلبات'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* جدول المشتركين */}
          <div style={{ background: CARD, borderRadius: 18, border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 2px 12px rgba(62,28,0,0.05)' }}>
            {/* Header الجدول */}
            <div style={{ background: BG, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${BORDER}` }}>
              <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                onChange={selectAll} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: BORDEAUX }} />
              <span style={{ color: '#6B3A2A', fontSize: '0.82rem', fontWeight: 700, flex: 1 }}>
                {selected.size > 0 ? `${selected.size} محدد` : `${filtered.length} مشترك`}
              </span>
              {selected.size > 0 && (
                <button onClick={() => setTab('compose')} style={{
                  background: `linear-gradient(to left,${BORDEAUX},#a82040)`, color: GOLD,
                  padding: '6px 14px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.78rem', fontFamily: 'Amiri, serif',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <FiMail size={12} /> إرسال للمحددين ({selected.size})
                </button>
              )}
            </div>
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {filtered.map((s, i) => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 16px', borderBottom: `1px solid ${BG}`,
                  background: selected.has(s.id) ? '#fdf0f2' : i % 2 === 0 ? CARD : '#FFFBF5',
                  transition: 'background 0.1s',
                }}>
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)}
                    style={{ width: 15, height: 15, cursor: 'pointer', accentColor: BORDEAUX, flexShrink: 0 }} />
                  {/* أفاتار */}
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${BORDEAUX},#a82040)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD, fontWeight: 700, fontSize: '0.82rem', flexShrink: 0 }}>
                    {s.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: TEXT, fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                    <p style={{ color: TEXT2, fontSize: '0.75rem' }}>{s.email}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    {s.country !== '—' && (
                      <span style={{ background: BG, color: '#6B3A2A', padding: '2px 8px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 600 }}>
                        {s.country}
                      </span>
                    )}
                    {s.orders > 0 && (
                      <span style={{ background: '#F0FDF4', color: '#16A34A', padding: '2px 8px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700, border: '1px solid #BBF7D0' }}>
                        {s.orders} طلب
                      </span>
                    )}
                    <span style={{ background: s.source === 'customer' ? '#EFF6FF' : '#F5F3FF', color: s.source === 'customer' ? '#2563EB' : '#7C3AED', padding: '2px 8px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 600 }}>
                      {s.source === 'customer' ? 'زبون' : 'يدوي'}
                    </span>
                    {s.source === 'manual' && (
                      <button onClick={() => removeSubscriber(s.id)} style={{ width: 26, height: 26, borderRadius: 6, background: '#FEE2E2', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiTrash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: TEXT2 }}>
                <FiUsers size={32} style={{ marginBottom: 10, opacity: 0.4 }} />
                <p>لا يوجد مشتركين</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ تاب إنشاء حملة ══════════ */}
      {tab === 'compose' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 20 }}>

          {/* القائمة الجانبية */}
          <div>
            {/* اختيار القالب */}
            <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: '16px', marginBottom: 16 }}>
              <p style={{ color: TEXT, fontWeight: 700, fontSize: '0.88rem', marginBottom: 12 }}>اختر قالب الرسالة</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TEMPLATES.map(tmpl => (
                  <button key={tmpl.id} onClick={() => selectTemplate(tmpl)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 10, border: '2px solid',
                    borderColor: activeTemplate?.id === tmpl.id ? tmpl.color : BORDER,
                    background: activeTemplate?.id === tmpl.id ? `${tmpl.color}10` : CARD,
                    cursor: 'pointer', textAlign: 'right', transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{tmpl.icon}</span>
                    <span style={{ color: activeTemplate?.id === tmpl.id ? tmpl.color : TEXT, fontWeight: activeTemplate?.id === tmpl.id ? 700 : 400, fontSize: '0.85rem' }}>
                      {tmpl.label}
                    </span>
                    {activeTemplate?.id === tmpl.id && <FiCheck size={14} color={tmpl.color} style={{ marginRight: 'auto' }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* المستلمون */}
            <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: '16px' }}>
              <p style={{ color: TEXT, fontWeight: 700, fontSize: '0.88rem', marginBottom: 8 }}>المستلمون</p>
              <div style={{ background: selected.size > 0 ? '#EFF6FF' : BG, borderRadius: 10, padding: '12px 14px', border: `1px solid ${selected.size > 0 ? '#BFDBFE' : BORDER}` }}>
                <p style={{ color: selected.size > 0 ? '#2563EB' : TEXT2, fontWeight: 700, fontSize: '1.1rem' }}>
                  {selected.size > 0 ? selected.size : filtered.length}
                </p>
                <p style={{ color: TEXT2, fontSize: '0.78rem' }}>
                  {selected.size > 0 ? 'مشترك محدد' : 'كل المشتركين المفلترين'}
                </p>
              </div>
              <button onClick={() => setTab('list')} style={{
                width: '100%', marginTop: 8, padding: '8px', borderRadius: 8,
                border: `2px dashed ${BORDER}`, background: CARD, color: TEXT2,
                cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Amiri, serif',
              }}>
                تغيير المستلمين
              </button>
            </div>
          </div>

          {/* محرر الرسالة */}
          <div>
            {!activeTemplate ? (
              <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: '48px', textAlign: 'center', color: TEXT2 }}>
                <FiMail size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
                <p>اختر قالباً من اليمين لتبدأ</p>
              </div>
            ) : (
              <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: '20px' }}>
                {/* عنوان الإيميل */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ color: TEXT, fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 5 }}>عنوان الإيميل *</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)}
                    style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = BORDEAUX}
                    onBlur={e => e.target.style.borderColor = BORDER} />
                </div>

                {/* حقول القالب */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {activeTemplate.fields.map(field => {
                    const labels = {
                      title_ar: 'العنوان الرئيسي', subtitle_ar: 'العنوان الفرعي',
                      body_ar: 'نص الرسالة', discount: 'نسبة الخصم',
                      code: 'كود الخصم', expiry: 'تاريخ الانتهاء',
                      cta: 'نص الزر', product_name: 'اسم المنتج',
                      product_desc: 'وصف المنتج', season: 'المناسبة',
                    }
                    const isLong = ['body_ar', 'product_desc', 'subtitle_ar'].includes(field)
                    return (
                      <div key={field}>
                        <label style={{ color: TEXT, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                          {labels[field] || field}
                        </label>
                        {isLong ? (
                          <textarea value={templateFields[field] || ''} onChange={e => setTemplateFields(f => ({ ...f, [field]: e.target.value }))}
                            rows={3} style={{ ...inputStyle, width: '100%', resize: 'vertical', boxSizing: 'border-box' }}
                            onFocus={e => e.target.style.borderColor = BORDEAUX}
                            onBlur={e => e.target.style.borderColor = BORDER} />
                        ) : (
                          <input value={templateFields[field] || ''} onChange={e => setTemplateFields(f => ({ ...f, [field]: e.target.value }))}
                            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                            onFocus={e => e.target.style.borderColor = BORDEAUX}
                            onBlur={e => e.target.style.borderColor = BORDER} />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* أزرار */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setPreview(!preview)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 10,
                    border: `2px solid ${BORDER}`, background: preview ? BG2 : CARD,
                    color: TEXT2, cursor: 'pointer', fontFamily: 'Amiri, serif',
                    fontWeight: 600, fontSize: '0.85rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}>
                    <FiEye size={14} /> {preview ? 'إخفاء المعاينة' : 'معاينة'}
                  </button>
                  <button onClick={handleSend} disabled={sending} style={{
                    flex: 2, padding: '10px 0', borderRadius: 10, border: 'none',
                    background: sending ? BG2 : `linear-gradient(to left,${BORDEAUX},#a82040)`,
                    color: sending ? TEXT2 : GOLD,
                    cursor: sending ? 'not-allowed' : 'pointer',
                    fontWeight: 700, fontSize: '0.88rem', fontFamily: 'Amiri, serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    {sending ? (
                      <>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${TEXT2}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                        {sendProgress}% جاري الإرسال...
                      </>
                    ) : (
                      <><FiSend size={14} /> إرسال ({selected.size || filtered.length})</>
                    )}
                  </button>
                </div>

                {/* شريط التقدم */}
                {sending && (
                  <div style={{ marginTop: 12, background: BG, borderRadius: 50, height: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${sendProgress}%`, background: `linear-gradient(to left,${BORDEAUX},#a82040)`, borderRadius: 50, transition: 'width 0.3s' }} />
                  </div>
                )}
              </div>
            )}

            {/* معاينة */}
            {preview && activeTemplate && (
              <div style={{ marginTop: 16, background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                <div style={{ background: BG, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiEye size={14} color={TEXT2} />
                  <span style={{ color: TEXT2, fontSize: '0.82rem', fontWeight: 600 }}>معاينة الرسالة</span>
                </div>
                <div style={{ padding: 16 }}>
                  <iframe
                    srcDoc={buildEmailHtml(activeTemplate, templateFields)}
                    style={{ width: '100%', height: 500, border: 'none', borderRadius: 8 }}
                    title="preview"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ══════════ تاب HTML مخصص ══════════ */}
      {tab === 'custom' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 20 }}>

          {/* المحرر */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: '18px' }}>
              <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '0.92rem', marginBottom: 14, fontFamily: 'Amiri, serif' }}>
                HTML مخصص
              </h3>

              {/* العنوان */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: TEXT, fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 5 }}>عنوان الإيميل *</label>
                <input
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  placeholder="عنوان الرسالة..."
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = BORDEAUX}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />
              </div>

              {/* محرر HTML */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: TEXT, fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 5 }}>
                  كود HTML
                  <span style={{ color: TEXT2, fontWeight: 400, fontSize: '0.75rem', marginRight: 6 }}>— الصق كود HTML جاهز</span>
                </label>
                <textarea
                  value={customHtml}
                  onChange={e => setCustomHtml(e.target.value)}
                  placeholder="<!DOCTYPE html>&#10;<html>&#10;  <body>&#10;    <h1>مرحباً!</h1>&#10;  </body>&#10;</html>"
                  rows={16}
                  style={{
                    ...inputStyle, width: '100%', boxSizing: 'border-box',
                    resize: 'vertical', fontFamily: 'monospace',
                    fontSize: '0.78rem', lineHeight: 1.6,
                    minHeight: 280,
                  }}
                  onFocus={e => e.target.style.borderColor = BORDEAUX}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />
              </div>

              {/* إحصائيات الكود */}
              {customHtml && (
                <div style={{ background: BG, borderRadius: 8, padding: '8px 12px', marginBottom: 12, display: 'flex', gap: 16 }}>
                  <span style={{ color: TEXT2, fontSize: '0.75rem' }}>
                    {customHtml.length.toLocaleString()} حرف
                  </span>
                  <span style={{ color: TEXT2, fontSize: '0.75rem' }}>
                    {customHtml.split('\n').length} سطر
                  </span>
                  <span style={{ color: customHtml.includes('<html') ? '#16A34A' : '#D97706', fontSize: '0.75rem', fontWeight: 600 }}>
                    {customHtml.includes('<html') ? '✓ HTML كامل' : '⚠ HTML جزئي'}
                  </span>
                </div>
              )}

              {/* أزرار */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setCustomPreview(!customPreview)}
                  disabled={!customHtml.trim()}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 10,
                    border: `2px solid ${customPreview ? BORDEAUX : BORDER}`,
                    background: customPreview ? BG2 : CARD,
                    color: customPreview ? TEXT : TEXT2,
                    cursor: customHtml.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'Amiri, serif', fontWeight: 600, fontSize: '0.85rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    opacity: customHtml.trim() ? 1 : 0.5,
                  }}
                >
                  <FiEye size={14} /> {customPreview ? 'إخفاء المعاينة' : 'معاينة'}
                </button>
                <button
                  onClick={async () => {
                    if (!customSubject.trim()) { toast.error('العنوان مطلوب'); return }
                    if (!customHtml.trim()) { toast.error('الكود HTML مطلوب'); return }
                    const targets = filtered.filter(s => selected.size === 0 || selected.has(s.id))
                    if (targets.length === 0) { toast.error('لا يوجد مشتركين'); return }
                    if (!confirm(`إرسال لـ ${targets.length} مشترك؟`)) return
                    setSending(true); setSendProgress(0)
                    let success = 0
                    for (let i = 0; i < targets.length; i++) {
                      try {
                        await sendNewsletterEmail({ to: targets[i].email, toName: targets[i].name, subject: customSubject, html: customHtml })
                        success++
                      } catch (err) { console.error(err) }
                      setSendProgress(Math.round(((i + 1) / targets.length) * 100))
                      if (i < targets.length - 1) await new Promise(r => setTimeout(r, 200))
                    }
                    setSending(false); setSendProgress(0)
                    toast.success(`تم الإرسال لـ ${success} من ${targets.length} مشترك! 📧`)
                  }}
                  disabled={sending || !customHtml.trim() || !customSubject.trim()}
                  style={{
                    flex: 2, padding: '10px 0', borderRadius: 10, border: 'none',
                    background: sending || !customHtml.trim() || !customSubject.trim()
                      ? BG2 : `linear-gradient(to left,${BORDEAUX},#a82040)`,
                    color: sending || !customHtml.trim() || !customSubject.trim() ? TEXT2 : GOLD,
                    cursor: sending || !customHtml.trim() || !customSubject.trim() ? 'not-allowed' : 'pointer',
                    fontWeight: 700, fontSize: '0.88rem', fontFamily: 'Amiri, serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {sending ? (
                    <><div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${TEXT2}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /> {sendProgress}% جاري الإرسال...</>
                  ) : (
                    <><FiSend size={14} /> إرسال ({selected.size || filtered.length})</>
                  )}
                </button>
              </div>

              {/* شريط التقدم */}
              {sending && (
                <div style={{ marginTop: 10, background: BG, borderRadius: 50, height: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${sendProgress}%`, background: `linear-gradient(to left,${BORDEAUX},#a82040)`, borderRadius: 50, transition: 'width 0.3s' }} />
                </div>
              )}
            </div>

            {/* المستلمون */}
            <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, padding: '16px' }}>
              <p style={{ color: TEXT, fontWeight: 700, fontSize: '0.88rem', marginBottom: 8 }}>المستلمون</p>
              <div style={{ background: selected.size > 0 ? '#EFF6FF' : BG, borderRadius: 10, padding: '12px 14px', border: `1px solid ${selected.size > 0 ? '#BFDBFE' : BORDER}` }}>
                <p style={{ color: selected.size > 0 ? '#2563EB' : TEXT2, fontWeight: 700, fontSize: '1.1rem' }}>
                  {selected.size > 0 ? selected.size : filtered.length}
                </p>
                <p style={{ color: TEXT2, fontSize: '0.78rem' }}>{selected.size > 0 ? 'مشترك محدد' : 'كل المشتركين المفلترين'}</p>
              </div>
              <button onClick={() => setTab('list')} style={{
                width: '100%', marginTop: 8, padding: '8px', borderRadius: 8,
                border: `2px dashed ${BORDER}`, background: CARD, color: TEXT2,
                cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Amiri, serif',
              }}>
                تغيير المستلمين
              </button>
            </div>
          </div>

          {/* المعاينة */}
          {customPreview && customHtml && (
            <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
              <div style={{ background: BG, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: `1px solid ${BORDER}` }}>
                <FiEye size={14} color={TEXT2} />
                <span style={{ color: TEXT2, fontSize: '0.82rem', fontWeight: 600 }}>معاينة مباشرة</span>
                <span style={{ color: TEXT2, fontSize: '0.72rem', marginRight: 'auto' }}>
                  {customSubject || 'بدون عنوان'}
                </span>
              </div>
              <div style={{ padding: 12 }}>
                <iframe
                  srcDoc={customHtml}
                  style={{ width: '100%', height: 600, border: 'none', borderRadius: 8 }}
                  title="custom-preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}