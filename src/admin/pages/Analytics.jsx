import { useState, useEffect, useMemo } from 'react'
import {
  FiTrendingUp, FiShoppingCart, FiDollarSign, FiRepeat,
  FiBarChart2, FiPieChart, FiMapPin, FiUsers, FiActivity,
  FiCreditCard, FiPackage, FiCheckCircle, FiXCircle,
} from 'react-icons/fi'
import { db } from '../../firebase'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'

/* ═══════════ ألوان الهوية ═══════════ */
const BORDEAUX = '#7b192c'
const GOLD     = '#f4be69'
const CARD     = '#ffffff'
const TEXT     = '#3E1C00'
const TEXT2    = '#9C6B4E'
const BORDER   = '#E2C9A8'
const PALETTE  = ['#7b192c', '#f4be69', '#16A34A', '#2563EB', '#D97706', '#0891B2', '#7C3AED', '#DB2777', '#65A30D', '#9333EA']

const statusLabels = {
  awaiting_payment: 'بانتظار التحويل',
  pending_payment:  'إيصال مرفوع',
  receipt_uploaded: 'إيصال مرفوع',
  pending:          'قيد المراجعة',
  confirmed:        'مؤكد',
  shipping:         'قيد الشحن',
  delivered:        'تم التسليم',
  cancelled:        'ملغي',
}

/* ═══════════ أدوات مساعدة ═══════════ */
const fmtTRY = n => '₺' + Math.round(n || 0).toLocaleString('en-US')
const fmtNum = n => (n || 0).toLocaleString('en-US')

function dayKey(d) { return new Date(d).toISOString().slice(0, 10) }
function shortDay(key) {
  const d = new Date(key + 'T00:00:00')
  return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
}
function orderTotal(o) { return o.pricingTRY?.total || o.pricing?.total || 0 }
function orderDate(o) {
  const c = o.createdAt
  if (!c) return null
  if (typeof c === 'string') return new Date(c)
  if (c.toDate) return c.toDate()
  return new Date(c)
}

/* ═══════════ رسم: مخطّط مساحي (Area) ═══════════ */
function AreaChart({ data, color = BORDEAUX, valueFmt = fmtNum, height = 210 }) {
  const W = 720, H = height, padX = 34, padT = 18, padB = 30
  const n = data.length
  const max = Math.max(1, ...data.map(d => d.value))
  const X = i => padX + (i * (W - 2 * padX)) / Math.max(1, n - 1)
  const Y = v => H - padB - (v / max) * (H - padT - padB)
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${X(i).toFixed(1)},${Y(d.value).toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${X(n - 1).toFixed(1)},${H - padB} L${X(0).toFixed(1)},${H - padB} Z`
  const gid = 'g' + color.replace('#', '')
  const ticks = [0, 0.5, 1].map(t => Math.round(max * t))
  const labelIdx = n <= 1 ? [0] : [0, Math.floor(n / 2), n - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => {
        const y = Y(t)
        return (
          <g key={i}>
            <line x1={padX} y1={y} x2={W - padX} y2={y} stroke={BORDER} strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
            <text x={W - padX + 4} y={y + 3} fontSize="10" fill={TEXT2} textAnchor="start">{valueFmt(t)}</text>
          </g>
        )
      })}
      <path d={areaPath} fill={`url(#${gid})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (n <= 31) && (
        <circle key={i} cx={X(i)} cy={Y(d.value)} r={n > 20 ? 1.6 : 2.6} fill={color} />
      ))}
      {labelIdx.map(i => (
        <text key={i} x={X(i)} y={H - 10} fontSize="10" fill={TEXT2} textAnchor="middle">{data[i] ? shortDay(data[i].key) : ''}</text>
      ))}
    </svg>
  )
}

/* ═══════════ رسم: أعمدة عموديّة ═══════════ */
function BarsChart({ data, color = GOLD, valueFmt = fmtNum, height = 200 }) {
  const W = 720, H = height, padX = 34, padT = 18, padB = 30
  const n = data.length
  const max = Math.max(1, ...data.map(d => d.value))
  const gap = n > 40 ? 1 : 4
  const bw = (W - 2 * padX) / n - gap
  const Y = v => H - padB - (v / max) * (H - padT - padB)
  const labelIdx = n <= 1 ? [0] : [0, Math.floor(n / 2), n - 1]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} preserveAspectRatio="none">
      {[0, 0.5, 1].map((t, i) => {
        const y = Y(max * t)
        return <line key={i} x1={padX} y1={y} x2={W - padX} y2={y} stroke={BORDER} strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
      })}
      {data.map((d, i) => {
        const x = padX + i * ((W - 2 * padX) / n) + gap / 2
        const y = Y(d.value)
        return <rect key={i} x={x} y={y} width={Math.max(1, bw)} height={H - padB - y} rx={bw > 6 ? 3 : 1} fill={color} opacity={d.value === 0 ? 0.25 : 1} />
      })}
      {labelIdx.map(i => {
        const x = padX + i * ((W - 2 * padX) / n) + ((W - 2 * padX) / n) / 2
        return <text key={i} x={x} y={H - 10} fontSize="10" fill={TEXT2} textAnchor="middle">{data[i] ? shortDay(data[i].key) : ''}</text>
      })}
    </svg>
  )
}

/* ═══════════ رسم: أعمدة أفقيّة ═══════════ */
function HBars({ rows, valueFmt = fmtNum }) {
  const max = Math.max(1, ...rows.map(r => r.value))
  if (!rows.length) return <Empty />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rows.map((r, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: TEXT, fontSize: '0.82rem', fontWeight: 600, minWidth: 0 }}>
              {r.icon && <span style={{ flexShrink: 0 }}>{r.icon}</span>}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
            </span>
            <span style={{ color: r.color || BORDEAUX, fontSize: '0.82rem', fontWeight: 800, flexShrink: 0, marginInlineStart: 8 }}>{valueFmt(r.value)}</span>
          </div>
          <div style={{ height: 9, background: '#F5E6D3', borderRadius: 50, overflow: 'hidden' }}>
            <div style={{ width: `${(r.value / max) * 100}%`, height: '100%', background: `linear-gradient(to left, ${r.color || BORDEAUX}, ${r.color2 || GOLD})`, borderRadius: 50, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ═══════════ رسم: دونات ═══════════ */
function Donut({ segments, centerLabel, centerSub }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  const R = 60, C = 2 * Math.PI * R, SW = 22
  let offset = 0
  if (!total) return <Empty />
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <svg width="150" height="150" viewBox="0 0 150 150" style={{ flexShrink: 0 }}>
        <g transform="translate(75,75) rotate(-90)">
          <circle r={R} fill="none" stroke="#F5E6D3" strokeWidth={SW} />
          {segments.map((s, i) => {
            const frac = s.value / total
            const dash = `${(frac * C).toFixed(2)} ${C.toFixed(2)}`
            const el = <circle key={i} r={R} fill="none" stroke={s.color} strokeWidth={SW} strokeDasharray={dash} strokeDashoffset={-offset} />
            offset += frac * C
            return el
          })}
        </g>
        <text x="75" y="71" textAnchor="middle" fontSize="20" fontWeight="800" fill={TEXT}>{centerLabel}</text>
        <text x="75" y="89" textAnchor="middle" fontSize="10" fill={TEXT2}>{centerSub}</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, minWidth: 130 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ color: TEXT, fontSize: '0.8rem', flex: 1 }}>{s.label}</span>
            <span style={{ color: TEXT2, fontSize: '0.78rem', fontWeight: 700 }}>{s.value} ({total ? Math.round((s.value / total) * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Empty({ text = 'لا توجد بيانات بعد' }) {
  return <div style={{ padding: '30px 0', textAlign: 'center', color: TEXT2, fontSize: '0.84rem' }}>{text}</div>
}

/* ═══════════ بطاقة KPI ═══════════ */
function Kpi({ icon, label, value, sub, accent = BORDEAUX }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '16px 18px', boxShadow: '0 2px 10px rgba(62,28,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ color: TEXT2, fontSize: '0.78rem', fontWeight: 600 }}>{label}</span>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: `${accent}14`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      </div>
      <p style={{ color: TEXT, fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Amiri, serif', lineHeight: 1.1 }}>{value}</p>
      {sub && <p style={{ color: TEXT2, fontSize: '0.74rem', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

/* ═══════════ غلاف قسم رسم ═══════════ */
function Panel({ title, icon, children, extra }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '18px 18px 20px', boxShadow: '0 2px 10px rgba(62,28,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Amiri, serif' }}>
          <span style={{ color: BORDEAUX }}>{icon}</span> {title}
        </h3>
        {extra}
      </div>
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════ */
export default function Analytics() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [logins, setLogins] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(30) // 7 / 30 / 90 / 0=all

  useEffect(() => {
    const unsubs = []
    unsubs.push(onSnapshot(collection(db, 'orders'), snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, () => setLoading(false)))
    unsubs.push(onSnapshot(collection(db, 'users'), snap => setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() })))))
    unsubs.push(onSnapshot(query(collection(db, 'activity_log'), orderBy('at', 'desc'), limit(40)), snap => {
      setLogins(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }, () => {}))
    return () => unsubs.forEach(u => u())
  }, [])

  /* ─── الطلبات ضمن الفترة ─── */
  const filtered = useMemo(() => {
    if (!period) return orders
    const cutoff = Date.now() - period * 86400000
    return orders.filter(o => { const d = orderDate(o); return d && d.getTime() >= cutoff })
  }, [orders, period])

  /* ─── الطلبات المحتسَبة (غير الملغيّة/المنتظرة) ─── */
  const paid = useMemo(() => filtered.filter(o => !['cancelled', 'awaiting_payment'].includes(o.status)), [filtered])

  /* ─── KPIs ─── */
  const revenue   = useMemo(() => paid.reduce((s, o) => s + orderTotal(o), 0), [paid])
  const aov       = paid.length ? revenue / paid.length : 0
  const cancelled = filtered.filter(o => o.status === 'cancelled').length
  const cancelRate = filtered.length ? Math.round((cancelled / filtered.length) * 100) : 0

  /* ─── العملاء المتكرّرون ─── */
  const repeatRate = useMemo(() => {
    const map = {}
    orders.forEach(o => {
      const k = o.customer?.email || o.customer?.phone || o.customer?.name
      if (k) map[k] = (map[k] || 0) + 1
    })
    const keys = Object.keys(map)
    const rep = keys.filter(k => map[k] > 1).length
    return keys.length ? Math.round((rep / keys.length) * 100) : 0
  }, [orders])

  /* ─── سلاسل زمنيّة (يوميّة) ─── */
  const days = period || 30
  const series = useMemo(() => {
    const keys = []
    for (let i = days - 1; i >= 0; i--) keys.push(dayKey(Date.now() - i * 86400000))
    const rev = {}, cnt = {}
    keys.forEach(k => { rev[k] = 0; cnt[k] = 0 })
    paid.forEach(o => { const d = orderDate(o); if (!d) return; const k = dayKey(d); if (k in rev) { rev[k] += orderTotal(o); cnt[k] += 1 } })
    return {
      revenue: keys.map(k => ({ key: k, value: Math.round(rev[k]) })),
      count:   keys.map(k => ({ key: k, value: cnt[k] })),
    }
  }, [paid, days])

  /* ─── عملاء جدد عبر الزمن ─── */
  const custSeries = useMemo(() => {
    const keys = []
    for (let i = days - 1; i >= 0; i--) keys.push(dayKey(Date.now() - i * 86400000))
    const m = {}; keys.forEach(k => m[k] = 0)
    customers.forEach(c => {
      const raw = c.createdAt || c.created_at
      if (!raw) return
      const d = typeof raw === 'string' ? new Date(raw) : (raw.toDate ? raw.toDate() : new Date(raw))
      const k = dayKey(d); if (k in m) m[k] += 1
    })
    return keys.map(k => ({ key: k, value: m[k] }))
  }, [customers, days])

  /* ─── أكثر المنتجات مبيعاً ─── */
  const topProducts = useMemo(() => {
    const m = {}
    paid.forEach(o => (o.items || []).forEach(it => {
      const name = it.name || 'منتج'
      m[name] = (m[name] || 0) + (it.qty || 1)
    }))
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 7)
      .map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }))
  }, [paid])

  /* ─── المبيعات حسب الدولة ─── */
  const byCountry = useMemo(() => {
    const m = {}
    paid.forEach(o => { const c = o.customer?.country || 'غير محدّد'; m[c] = (m[c] || 0) + orderTotal(o) })
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 7)
      .map(([label, value], i) => ({ label, value: Math.round(value), color: PALETTE[i % PALETTE.length], icon: <FiMapPin size={12} /> }))
  }, [paid])

  /* ─── طرق الدفع ─── */
  const payMethods = useMemo(() => {
    let cod = 0, bank = 0, other = 0
    paid.forEach(o => {
      const m = (o.payment?.method || '').toLowerCase()
      if (m === 'cod') cod++
      else if (m === 'transfer' || m === 'bank') bank++
      else other++
    })
    const segs = [
      { label: 'الدفع عند الاستلام', value: cod, color: GOLD },
      { label: 'تحويل بنكي', value: bank, color: BORDEAUX },
    ]
    if (other) segs.push({ label: 'أخرى', value: other, color: '#9CA3AF' })
    return segs.filter(s => s.value > 0)
  }, [paid])

  /* ─── توزيع الحالات ─── */
  const statusSegs = useMemo(() => {
    const m = {}
    filtered.forEach(o => { const s = o.status || 'pending'; m[s] = (m[s] || 0) + 1 })
    return Object.entries(m).sort((a, b) => b[1] - a[1])
      .map(([s, value], i) => ({ label: statusLabels[s] || s, value, color: PALETTE[i % PALETTE.length] }))
  }, [filtered])

  const periodLabel = { 7: 'آخر 7 أيام', 30: 'آخر 30 يوماً', 90: 'آخر 90 يوماً', 0: 'كل الفترة' }[period]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', color: TEXT, fontFamily: 'Amiri, serif', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 9 }}>
            <FiBarChart2 color={BORDEAUX} /> التحليلات المتقدّمة
          </h1>
          <p style={{ color: TEXT2, fontSize: '0.85rem' }}>تحليل شامل لأداء المتجر — {periodLabel} · الأسعار بالليرة التركية ₺</p>
        </div>
        {/* مبدّل الفترة */}
        <div style={{ display: 'flex', gap: 4, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 50, padding: 4 }}>
          {[{ v: 7, l: '7 أيام' }, { v: 30, l: '30 يوم' }, { v: 90, l: '90 يوم' }, { v: 0, l: 'الكل' }].map(p => (
            <button key={p.v} onClick={() => setPeriod(p.v)} style={{
              border: 'none', cursor: 'pointer', padding: '6px 14px', borderRadius: 50,
              fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Amiri, serif',
              background: period === p.v ? `linear-gradient(to left, ${BORDEAUX}, #a82040)` : 'transparent',
              color: period === p.v ? GOLD : TEXT2, transition: 'all 0.2s',
            }}>{p.l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: TEXT2 }}>جارٍ تحميل البيانات…</div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
            <Kpi icon={<FiDollarSign size={17} />} label="الإيرادات" value={fmtTRY(revenue)} sub={`${paid.length} طلب محتسَب`} accent={BORDEAUX} />
            <Kpi icon={<FiShoppingCart size={17} />} label="إجمالي الطلبات" value={fmtNum(filtered.length)} sub={`${periodLabel}`} accent="#2563EB" />
            <Kpi icon={<FiTrendingUp size={17} />} label="متوسّط قيمة الطلب" value={fmtTRY(aov)} sub="AOV" accent="#16A34A" />
            <Kpi icon={<FiRepeat size={17} />} label="العملاء المتكرّرون" value={`${repeatRate}%`} sub="من إجمالي العملاء" accent="#7C3AED" />
            <Kpi icon={<FiXCircle size={17} />} label="نسبة الإلغاء" value={`${cancelRate}%`} sub={`${cancelled} طلب ملغي`} accent="#DC2626" />
            <Kpi icon={<FiUsers size={17} />} label="إجمالي العملاء" value={fmtNum(customers.length)} sub="حساب مسجّل" accent="#D97706" />
          </div>

          {/* الإيرادات عبر الزمن */}
          <div style={{ marginBottom: 16 }}>
            <Panel title="الإيرادات عبر الزمن" icon={<FiTrendingUp size={16} />} extra={<span style={{ color: BORDEAUX, fontWeight: 800, fontSize: '0.95rem', fontFamily: 'Amiri, serif' }}>{fmtTRY(revenue)}</span>}>
              {series.revenue.some(d => d.value > 0) ? <AreaChart data={series.revenue} color={BORDEAUX} valueFmt={fmtTRY} /> : <Empty />}
            </Panel>
          </div>

          {/* عدد الطلبات عبر الزمن */}
          <div style={{ marginBottom: 16 }}>
            <Panel title="عدد الطلبات عبر الزمن" icon={<FiShoppingCart size={16} />} extra={<span style={{ color: TEXT2, fontSize: '0.82rem' }}>{fmtNum(paid.length)} طلب</span>}>
              {series.count.some(d => d.value > 0) ? <BarsChart data={series.count} color={GOLD} /> : <Empty />}
            </Panel>
          </div>

          {/* صفّان: المنتجات + الدول */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 16 }}>
            <Panel title="أكثر المنتجات مبيعاً" icon={<FiPackage size={16} />}>
              <HBars rows={topProducts} valueFmt={v => `${v} قطعة`} />
            </Panel>
            <Panel title="المبيعات حسب الدولة" icon={<FiMapPin size={16} />}>
              <HBars rows={byCountry} valueFmt={fmtTRY} />
            </Panel>
          </div>

          {/* صفّان: طرق الدفع + الحالات */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 16 }}>
            <Panel title="طرق الدفع" icon={<FiCreditCard size={16} />}>
              <Donut segments={payMethods} centerLabel={fmtNum(paid.length)} centerSub="طلب" />
            </Panel>
            <Panel title="توزيع حالات الطلبات" icon={<FiPieChart size={16} />}>
              <Donut segments={statusSegs} centerLabel={fmtNum(filtered.length)} centerSub="طلب" />
            </Panel>
          </div>

          {/* عملاء جدد */}
          <div style={{ marginBottom: 16 }}>
            <Panel title="عملاء جدد عبر الزمن" icon={<FiUsers size={16} />}>
              {custSeries.some(d => d.value > 0) ? <BarsChart data={custSeries} color="#16A34A" /> : <Empty text="لا تتوفّر تواريخ تسجيل للعملاء" />}
            </Panel>
          </div>

          {/* سجلّ الدخول */}
          <Panel title="سجلّ الدخول للوحة التحكّم" icon={<FiActivity size={16} />} extra={<span style={{ color: TEXT2, fontSize: '0.78rem' }}>آخر {logins.length} محاولة</span>}>
            {logins.length === 0 ? <Empty text="لا توجد سجلّات بعد (تأكّد من نشر قواعد Firestore)" /> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}`, color: TEXT2, textAlign: 'right' }}>
                      <th style={{ padding: '8px 10px', fontWeight: 700 }}>الحالة</th>
                      <th style={{ padding: '8px 10px', fontWeight: 700 }}>التاريخ والوقت</th>
                      <th style={{ padding: '8px 10px', fontWeight: 700 }}>الجهاز</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logins.map(l => {
                      const d = l.at?.toDate ? l.at.toDate() : (l.at ? new Date(l.at) : null)
                      return (
                        <tr key={l.id} style={{ borderBottom: '1px solid #F5E6D3' }}>
                          <td style={{ padding: '9px 10px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 50, fontWeight: 700, fontSize: '0.72rem', background: l.success ? '#F0FDF4' : '#FEF2F2', color: l.success ? '#16A34A' : '#DC2626' }}>
                              {l.success ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                              {l.success ? 'ناجح' : 'فاشل'}
                            </span>
                          </td>
                          <td style={{ padding: '9px 10px', color: TEXT, whiteSpace: 'nowrap' }}>{d ? d.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</td>
                          <td style={{ padding: '9px 10px', color: TEXT2, maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.userAgent}>{l.userAgent || '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </>
      )}
    </div>
  )
}
