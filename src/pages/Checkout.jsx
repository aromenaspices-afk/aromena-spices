import { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { FiShoppingBag, FiCheck, FiChevronRight, FiChevronLeft, FiCopy, FiX, FiMapPin, FiCreditCard, FiBriefcase, FiDollarSign, FiSmartphone, FiTruck } from 'react-icons/fi'
import { db, storage } from '../firebase'
import { collection, addDoc, getDocs, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore'
import { useCollection } from '../hooks/useFirestore'
import toast from 'react-hot-toast'
import { sendOrderConfirmEmail, sendAdminNewOrderEmail } from '../utils/emailService'
import OrderSuccess from '../components/OrderSuccess'
import { useCurrency } from '../context/CurrencyContext'
import { calculateShipping } from '../utils/shippingData'

// نقطة تهيئة الدفع — Edge (قرب تركيا). للتراجع الفوريّ: '/.netlify/functions/iyzico-init'
const IYZICO_INIT_URL = '/api/iyzico-init'


const BANK_INFO = {
  iban:        'TR11 0020 3000 0093 3795 7000 001',
  bankName:    'Albaraka Türk Katılım Bankası A.Ş.',
  accountName: 'FAOUR GROUP TURİZM HİZMETLERİ LİMİTED ŞİRKETİ',
  swift:       'BTFHTRIS',
}


const COUNTRY_LIST = [
  { ar: 'تركيّا',             en: 'Turkey',       flag: '🇹🇷' },
  { ar: 'السعودية',          en: 'Saudi Arabia', flag: '🇸🇦' },
  { ar: 'سوريا',             en: 'Syria',        flag: '🇸🇾' },
  { ar: 'الأردن',            en: 'Jordan',       flag: '🇯🇴' },
  { ar: 'الإمارات',          en: 'UAE',          flag: '🇦🇪' },
  { ar: 'البحرين',           en: 'Bahrain',      flag: '🇧🇭' },
  { ar: 'الكويت',            en: 'Kuwait',       flag: '🇰🇼' },
  { ar: 'قطر',               en: 'Qatar',        flag: '🇶🇦' },
  { ar: 'لبنان',             en: 'Lebanon',      flag: '🇱🇧' },
  { ar: 'العراق',            en: 'Iraq',         flag: '🇮🇶' },
  { ar: 'مصر',               en: 'Egypt',        flag: '🇪🇬' },
  { ar: 'المغرب',            en: 'Morocco',      flag: '🇲🇦' },
  { ar: 'ألمانيا',           en: 'Germany',      flag: '🇩🇪' },
  { ar: 'هولندا',            en: 'Netherlands',  flag: '🇳🇱' },
  { ar: 'فرنسا',             en: 'France',       flag: '🇫🇷' },
  { ar: 'بلجيكا',            en: 'Belgium',      flag: '🇧🇪' },
  { ar: 'النمسا',            en: 'Austria',      flag: '🇦🇹' },
  { ar: 'إسبانيا',           en: 'Spain',        flag: '🇪🇸' },
  { ar: 'إيطاليا',           en: 'Italy',        flag: '🇮🇹' },
  { ar: 'السويد',            en: 'Sweden',       flag: '🇸🇪' },
  { ar: 'سويسرا',            en: 'Switzerland',  flag: '🇨🇭' },
  { ar: 'المملكة المتحدة',   en: 'UK',           flag: '🇬🇧' },
]


function CountryDropdown({ value, onChange, isAr }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const selected = COUNTRY_LIST.find(c => c.ar === value)
  const filtered = COUNTRY_LIST.filter(c =>
    c.ar.includes(search) || c.en.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(!open)} style={{
        width: '100%', padding: '14px 16px', borderRadius: 14,
        border: `2px solid ${open ? '#7b192c' : '#E2C9A8'}`,
        background: '#fff', cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        fontFamily: 'Amiri, serif', transition: 'border-color 0.15s',
      }}>
        <span style={{ color: selected ? '#1a0610' : '#9C6B4E', fontSize: '0.95rem' }}>
          {selected ? `${selected.flag}  ${selected.ar}` : (isAr ? 'اختر دولتك...' : 'Select your country...')}
        </span>
        <FiChevronLeft size={16} color="#9C6B4E" style={{ transform: open ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <>
          <div onClick={() => { setOpen(false); setSearch('') }} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
          <div style={{ position: 'absolute', top: '105%', right: 0, left: 0, background: '#fff', borderRadius: 16, boxShadow: '0 12px 40px rgba(123,25,44,0.18)', border: '1px solid #E2C9A8', zIndex: 99, overflow: 'hidden', maxHeight: 300, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #F5E6D3' }}>
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder={isAr ? 'ابحث...' : 'Search...'}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1.5px solid #E2C9A8', fontSize: '0.88rem', outline: 'none', fontFamily: 'Amiri, serif', boxSizing: 'border-box' }} />
            </div>
            <div style={{ overflowY: 'auto' }}>
              {filtered.map(c => (
                <button key={c.en} type="button" onClick={() => { onChange(c.ar); setOpen(false); setSearch('') }}
                  style={{ width: '100%', padding: '11px 16px', border: 'none', background: value === c.ar ? '#fdf0f2' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #F5E6D3', fontFamily: 'Amiri, serif' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fdf0f2'}
                  onMouseLeave={e => e.currentTarget.style.background = value === c.ar ? '#fdf0f2' : '#fff'}>
                  <span style={{ fontSize: '1.2rem' }}>{c.flag}</span>
                  <span style={{ color: '#1a0610', fontWeight: value === c.ar ? 700 : 400, fontSize: '0.9rem' }}>{c.ar}</span>
                  {value === c.ar && <FiCheck size={14} color="#7b192c" style={{ marginRight: 'auto' }} />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}


function Field({ label, icon, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3E1C00', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>
          {icon && <span style={{ color: '#7b192c' }}>{icon}</span>}
          {label}
        </label>
      )}
      {children}
      {error && <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

function Input({ value, onChange, type = 'text', placeholder, required }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      value={value} onChange={e => onChange(e.target.value)}
      type={type} placeholder={placeholder} required={required}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width: '100%', padding: '14px 16px', borderRadius: 14,
        border: `2px solid ${focused ? '#7b192c' : '#E2C9A8'}`,
        fontSize: '0.92rem', color: '#1a0610', fontFamily: 'Amiri, serif',
        outline: 'none', background: '#fff', boxSizing: 'border-box',
        transition: 'border-color 0.15s',
      }}
    />
  )
}


// تنظيف بقايا Iyzico (سكربتات + متغيّرات عامّة) كي تُعاد التهيئة عند كلّ فتح
function cleanupIyzico() {
  try { document.querySelectorAll('script[src*="iyzipay"]').forEach(s => s.remove()) } catch { /* */ }
  try { document.querySelectorAll('script[id^="iyzipay"], script[id^="iyzi"]').forEach(s => s.remove()) } catch { /* */ }
  ;['iyziInit', 'iyziInitEditForm', '__iyzicoCheckoutForm', 'iyziInitCheckout'].forEach(k => {
    try { window[k] = undefined; delete window[k] } catch { /* */ }
  })
}

// نافذة الدفع المضمّن بالبطاقة عبر Iyzico
function CardSheet({ content, error, isAr, onClose }) {
  const hostRef = useRef(null)
  const [formReady, setFormReady] = useState(false)

  useEffect(() => {
    if (!content || !hostRef.current) return
    cleanupIyzico() // أزِل بقايا أيّ فتح سابق قبل التهيئة الجديدة
    setFormReady(false)
    const host = hostRef.current
    host.innerHTML = '<div id="iyzipay-checkout-form" class="responsive"></div>'
    const formEl = host.querySelector('#iyzipay-checkout-form')

    // مراقبة ظهور نموذج Iyzico (iframe) لإخفاء مؤشّر التحميل لحظة جهوزيّته
    const obs = new MutationObserver(() => {
      if (formEl && formEl.childNodes.length > 0) { setFormReady(true); obs.disconnect() }
    })
    if (formEl) obs.observe(formEl, { childList: true, subtree: true })
    // أمان: أخفِ المؤشّر بعد 15s مهما حدث
    const safety = setTimeout(() => setFormReady(true), 15000)

    // حقن سكربتات Iyzico وتنفيذها (innerHTML لا ينفّذ السكربت)
    const temp = document.createElement('div')
    temp.innerHTML = content
    const injected = []
    temp.querySelectorAll('script').forEach(old => {
      const s = document.createElement('script')
      if (old.src) s.src = old.src
      else s.textContent = old.textContent
      s.async = false
      document.body.appendChild(s)
      injected.push(s)
    })
    return () => { obs.disconnect(); clearTimeout(safety); injected.forEach(s => s.remove()); cleanupIyzico() }
  }, [content])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,6,16,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 14px', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.35)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(to left, #7b192c, #a82040)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#f4be69', fontWeight: 800, fontFamily: 'Amiri, serif', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiCreditCard size={18} /> {isAr ? 'دفع آمن بالبطاقة' : 'Secure Card Payment'}
          </span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', color: '#f4be69', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiX size={18} />
          </button>
        </div>
        <div style={{ padding: '18px 18px 24px', minHeight: 220 }}>
          {error ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <FiX size={40} color="#DC2626" />
              <p style={{ color: '#DC2626', fontWeight: 700, marginTop: 12, fontFamily: 'Amiri, serif' }}>{error}</p>
              <button onClick={onClose} style={{ marginTop: 16, background: '#7b192c', color: '#f4be69', border: 'none', borderRadius: 12, padding: '10px 28px', cursor: 'pointer', fontFamily: 'Amiri, serif', fontWeight: 700 }}>{isAr ? 'إغلاق' : 'Close'}</button>
            </div>
          ) : (
            <div style={{ position: 'relative', minHeight: 200 }}>
              <div ref={hostRef} />
              {(!content || !formReady) && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#9C6B4E', textAlign: 'center', borderRadius: 12 }}>
                  <div style={{ width: 38, height: 38, border: '3px solid #E2C9A8', borderTopColor: '#7b192c', borderRadius: '50%', marginBottom: 14, animation: 'spin 0.8s linear infinite' }} />
                  {isAr ? 'جارٍ تجهيز بوابة الدفع الآمنة…' : 'Preparing secure payment…'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function BankSheet({ orderNumber, total, isAr, onConfirm, onClose }) {
  const [copied, setCopied] = useState('')

  function copy(text, key) {
    navigator.clipboard?.writeText(text)
    setCopied(key)
    toast.success(isAr ? 'تمَّ النسخ!' : 'Copied!')
    setTimeout(() => setCopied(''), 2000)
  }

  const fields = [
    { key: 'iban',   label: 'IBAN',                                   value: BANK_INFO.iban,        star: false },
    { key: 'name',   label: isAr ? 'اسم الحساب' : 'Account Name',    value: BANK_INFO.accountName, star: false },
    { key: 'bank',   label: isAr ? 'البنك' : 'Bank',                 value: BANK_INFO.bankName,    star: false },
    { key: 'swift',  label: 'SWIFT / BIC',                            value: BANK_INFO.swift,       star: false },
    { key: 'reason', label: isAr ? 'سبب التّحويل' : 'Reason',         value: orderNumber,           star: true  },
  ]

  const waText = encodeURIComponent(isAr
    ? `مرحباً، أرسلت تحويلاً بنكياً لطلب رقم ${orderNumber} بمبلغ ${total}`
    : `Hello, I sent a bank transfer for order ${orderNumber} — amount ${total}`)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '88vh', overflowY: 'auto', paddingBottom: 24 }}>

        {/* مقبض */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#ddd', margin: '10px auto 0' }} />

        {/* الهيدر */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 10px', borderBottom: '1px solid #F5E6D3' }}>
          <div>
            <p style={{ color: '#1a0610', fontWeight: 700, fontSize: '0.92rem', fontFamily: 'Amiri, serif' }}>
              {isAr ? 'بيانات التّحويل البنكي' : 'Bank Transfer Details'}
            </p>
            <p style={{ color: '#7b192c', fontWeight: 800, fontSize: '0.88rem', marginTop: 2 }}>{total}</p>
          </div>
          <button onClick={onClose} style={{ background: '#F5E6D3', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiX size={14} color="#6B3A2A" />
          </button>
        </div>

        
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {fields.map(f => (
            <div key={f.key} style={{
              borderRadius: 12, padding: '10px 12px',
              background: f.key === 'reason' ? '#fdf0f2' : '#FFFBF5',
              border: `1.5px solid ${f.key === 'reason' ? '#f4be69' : '#E2C9A8'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#9C6B4E', fontSize: '0.65rem', fontWeight: 600, marginBottom: 3 }}>
                    {f.label} {f.star && <span style={{ color: '#f4be69' }}>★</span>}
                  </p>
                  <p style={{
                    color: f.key === 'reason' ? '#7b192c' : '#1a0610',
                    fontWeight: f.key === 'reason' ? 800 : 600,
                    fontSize: f.key === 'iban' ? '0.78rem' : f.key === 'name' ? '0.72rem' : '0.82rem',
                    direction: 'ltr', textAlign: 'right', wordBreak: 'break-all', lineHeight: 1.4,
                  }}>{f.value}</p>
                </div>
                <button onClick={() => copy(f.value, f.key)} style={{
                  flexShrink: 0, width: 52, height: 36,
                  background: copied === f.key ? '#16A34A' : 'rgba(123,25,44,0.07)',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  color: copied === f.key ? '#fff' : '#7b192c',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                  fontSize: '0.65rem', fontWeight: 700, fontFamily: 'Amiri, serif',
                  transition: 'background 0.2s',
                }}>
                  {copied === f.key ? <FiCheck size={13} /> : <FiCopy size={13} />}
                  {isAr ? 'نسخ' : 'Copy'}
                </button>
              </div>
            </div>
          ))}

          
          <div style={{ background: '#FFFBF0', borderRadius: 10, padding: '8px 12px', border: '1px solid #FDE68A', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', flexShrink: 0 }}>⚠️</span>
            <p style={{ color: '#92400E', fontSize: '0.72rem', lineHeight: 1.6 }}>
              {isAr ? 'تأكّد من كتابة رقم الطّلب كسبب للتّحويل لتسريع معالجة طلبك' : 'Include the order number as transfer reason to speed up processing'}
            </p>
          </div>

          
          <button onClick={onConfirm} style={{
            background: 'linear-gradient(to left, #7b192c, #a82040)',
            color: '#f4be69', padding: '14px 0', borderRadius: 14,
            fontWeight: 700, fontSize: '0.92rem', border: 'none',
            cursor: 'pointer', fontFamily: 'Amiri, serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 16px rgba(123,25,44,0.3)',
          }}>
            <FiCheck size={15} />
            {isAr ? 'تمَّ التّحويل' : 'Transfer Done'}
          </button>

          <a href={`https://wa.me/905550044476?text=${waText}`} target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#F0FDF4', color: '#16A34A',
            padding: '13px 0', borderRadius: 14,
            fontWeight: 700, fontSize: '0.88rem',
            textDecoration: 'none', border: '1.5px solid #BBF7D0',
            fontFamily: 'Amiri, serif',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#16A34A">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.12 1.529 5.845L0 24l6.335-1.652A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-4.994-1.363l-.358-.213-3.76.982 1.003-3.658-.234-.376A9.818 9.818 0 1112 21.818z"/>
            </svg>
            {isAr ? 'أرسل إيصالَ التّحويل عبر واتساب' : 'Send Receipt via WhatsApp'}
          </a>
        </div>
      </div>
    </div>
  )
}


async function generateOrderNumber() {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(1))
    const snap = await getDocs(q)
    let lastNum = 0
    if (!snap.empty) {
      const match = snap.docs[0].data().orderNumber?.match(/(\d+)$/)
      if (match) lastNum = parseInt(match[1])
    }
    return `ARO-${new Date().getFullYear()}-${String(lastNum + 1).padStart(4, '0')}`
  } catch {
    return `ARO-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`
  }
}



function CartBar({ items, updateQty, removeItem, formatPrice, isAr }) {
  const [open, setOpen] = useState(false)
  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = items.reduce((s, i) => s + (i.price || 0) * i.qty, 0)

  return (
    <>
     
      <div onClick={() => setOpen(!open)} style={{
        position: 'fixed', bottom: 100, right: 16, zIndex: 80,
        background: 'linear-gradient(135deg, #5a0f1e, #a82040)',
        borderRadius: 16, padding: '10px 14px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        cursor: 'pointer', boxShadow: '0 6px 24px rgba(123,25,44,0.45)',
        minWidth: 58,
      }}>
        <div style={{ position: 'relative' }}>
          <FiShoppingBag size={22} color="#f4be69" />
          {count > 0 && (
            <span style={{ position: 'absolute', top: -7, right: -9, background: '#f4be69', color: '#7b192c', borderRadius: '50%', width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900 }}>{count}</span>
          )}
        </div>
        <span style={{ color: '#f4be69', fontWeight: 900, fontSize: '0.7rem', fontFamily: 'Amiri, serif', whiteSpace: 'nowrap' }}>
          {formatPrice(total)}
        </span>
        <span style={{ color: 'rgba(244,190,105,0.7)', fontSize: '0.6rem', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▲</span>
      </div>

      
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 81 }} />
          <div style={{
            position: 'fixed', bottom: 0, right: 0, left: 0, zIndex: 82,
            background: '#fff', borderRadius: '20px 20px 0 0',
            maxHeight: '65vh', overflowY: 'auto',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.2)',
            paddingBottom: 80,
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E2C9A8', margin: '12px auto 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px 10px' }}>
              <p style={{ color: '#1a0610', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Amiri, serif' }}>
                {isAr ? `سلتك (${count})` : `Cart (${count})`}
              </p>
              <button onClick={() => setOpen(false)} style={{ background: '#F5E6D3', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiX size={13} color="#9C6B4E" />
              </button>
            </div>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFFBF5', borderRadius: 14, padding: '10px 12px', border: '1px solid #E2C9A8' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 10, background: '#F5E6D3', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FiShoppingBag size={16} color="#9C6B4E" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#1a0610', fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ color: '#9C6B4E', fontSize: '0.7rem' }}>{item.size}</p>
                    {/* محتوى الباقة */}
                    {item.isPackage && item.pkgItems?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                        {item.pkgItems.map((pi, j) => (
                          <span key={j} style={{ background: '#fdf0f2', color: '#7b192c', fontSize: '0.62rem', fontWeight: 600, padding: '2px 7px', borderRadius: 50, border: '1px solid rgba(123,25,44,0.15)' }}>
                            {pi.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <p style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.82rem' }}>{formatPrice(item.price * item.qty)}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => updateQty(item.id, item.size, item.qty - 1)} style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid #E2C9A8', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: '#7b192c' }}>−</button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a0610', minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.size, item.qty + 1)} style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid #E2C9A8', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: '#7b192c' }}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}


export default function Checkout() {
  const { t, i18n } = useTranslation()
  const { items, removeItem, updateQty, clearCart, total } = useCart()
  const { user, profile, updateUserProfile } = useAuth()
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()
  const { data: promoCodes } = useCollection('promocodes')
  const isAr = i18n.language === 'ar'

  const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', district: '', neighborhood: '', address: '', city: '', country: '' }

  const [step, setStep] = useState(1) // 1: التفاصيل | 2: الدفع | 3: المراجعة
  const [form, setForm] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('checkout_form') || 'null')
      return saved ? { ...EMPTY_FORM, ...saved } : EMPTY_FORM
    } catch { return EMPTY_FORM }
  })
  const [errors, setErrors] = useState({})
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponData, setCouponData] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [payment, setPayment] = useState(() => {
    const saved = localStorage.getItem('checkout_payment')
    return (saved === 'card' || saved === 'cod') ? saved : 'card'
  })
  const [agreed, setAgreed] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [showBank, setShowBank] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [cardError, setCardError] = useState('')
  const [shippingResult, setShippingResult] = useState({ price: 0, days: '5-7', found: false })

 
  useEffect(() => {
    if (!user || !profile) return
    const addr = profile.addresses?.[0]
    // املأ الحقول الفارغة فقط — لا تطمس ما أدخله المستخدم سابقاً
    setForm(f => ({
      ...f,
      firstName: f.firstName || profile.firstName || '',
      lastName: f.lastName || profile.lastName || '',
      email: f.email || user.email || '',
      phone: f.phone || addr?.phone || profile.phone || '',
      address: f.address || addr?.street || '',
      city: f.city || addr?.city || '',
      country: f.country || addr?.country || '',
    }))
  }, [user, profile])

  // حفظ البيانات تلقائياً ليُحتفظ بها عند الخروج والعودة
  useEffect(() => {
    try { localStorage.setItem('checkout_form', JSON.stringify(form)) } catch {}
  }, [form])

  useEffect(() => {
    localStorage.setItem('checkout_payment', payment)
  }, [payment])

  // تسخين دالّة الدفع مسبقاً عند الوصول لخطوة الدفع (يُحمّي الحاوية وحزمة SDK
  // بينما يكمل العميل، فيكون النموذج أسرع لاحقاً). طلب GET يُهمَل ردّه ولا يمسّ Iyzico.
  const warmedRef = useRef(false)
  useEffect(() => {
    if (step === 2 && !warmedRef.current) {
      warmedRef.current = true
      try { fetch(IYZICO_INIT_URL, { method: 'GET' }).catch(() => {}) } catch {}
    }
  }, [step])

  
  useEffect(() => {
    if (!form.country || !items.length) { setShippingResult({ price: 0, days: '5-7', found: false }); return }
    const weight = items.reduce((s, i) => s + (i.weightKg || 0.2) * i.qty, 0)
    const boxesOnly = items.every(i => i.isPackage)
    calculateShipping(form.country, weight, total, boxesOnly).then(setShippingResult)
  }, [form.country, items, total])

  const shipping = !form.country ? 0 : (shippingResult.price ?? 0)
  const discount = couponData ? (couponData.type === 'percent' ? total * (couponData.value / 100) : couponData.value) : 0
  const finalTotal = total + shipping - discount

 
  function validateStep1() {
    const e = {}
    if (!form.country)   e.country   = isAr ? 'الدولة مطلوبة' : 'Country required'
    if (!form.firstName) e.firstName = isAr ? 'الاسم مطلوب' : 'Name required'
    if (!form.email)     e.email     = isAr ? 'الإيميل مطلوب' : 'Email required'
    if (!form.phone)     e.phone     = isAr ? 'الهاتف مطلوب' : 'Phone required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function goNext() {
    if (step === 1 && !validateStep1()) return
    setStep(s => s + 1)
    window.scrollTo(0, 0)
  }

  function applyCoupon() {
    const code = coupon.trim().toUpperCase()
    const found = promoCodes.find(c => c.code === code)
    if (!found)        { setCouponError(isAr ? 'الكود غير موجود' : 'Code not found'); return }
    if (!found.active) { setCouponError(isAr ? 'الكود غير مفعّل' : 'Code inactive'); return }
    if (found.expires && new Date(found.expires) < new Date()) { setCouponError(isAr ? 'الكود منتهي' : 'Expired'); return }
    setCouponData(found); setCouponApplied(true); setCouponError('')
    toast.success(isAr ? 'تمَّ تطبيق الكوبون!' : 'Coupon applied!')
  }

  async function handleOrder() {
    if (!agreed) return
    // إجبار تسجيل الدخول قبل الشراء (شبكة أمان فوق ProtectedRoute) — يربط الطلب بالحساب
    if (!user || !user.uid) {
      toast.error(isAr ? 'يجب تسجيل الدخول لإتمام الطلب' : 'Please sign in to complete your order')
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    setLoading(true)
    try {
      const orderNum = await generateOrderNumber()
      const pricing = { subtotal: total, shipping, discount, total: finalTotal }
      const pricingTRY = { ...pricing, currency: 'TRY' }
      const orderItems = items.map(i => ({ id: i.id, productId: i.productId || i.id, name: i.name, size: i.size, price: i.price, priceTRY: i.price, qty: i.qty, image: i.image || null }))
      const docRef = await addDoc(collection(db, 'orders'), {
        orderNumber: orderNum, status: payment === 'cod' ? 'confirmed' : 'awaiting_payment',
        customer: { uid: user.uid, ...form, fullAddress: [form.district, form.neighborhood, form.address].filter(Boolean).join('، ') },
        items: orderItems,
        payment: { method: payment, status: 'pending' },
        pricing, pricingTRY,
        coupon: couponApplied ? couponData?.code : null,
        createdAt: new Date().toISOString(), notes: '',
      })
      setOrderNumber(orderNum)
      setOrderId(docRef.id)
      if (payment === 'cod') {
        try {
          await Promise.all([
            sendOrderConfirmEmail({ customer: { uid: user.uid, ...form }, orderNumber: orderNum, items: orderItems, pricing, pricingTRY: pricing, payment: { method: 'cod' }, createdAt: new Date().toISOString() }),
            sendAdminNewOrderEmail({ orderNumber: orderNum, customer: { uid: user.uid, ...form }, items: orderItems, pricing, pricingTRY: pricing, payment: { method: 'cod' }, createdAt: new Date().toISOString() }),
          ])
        } catch (emailErr) { console.error('COD order email failed:', emailErr) }
        clearCart()
        try { localStorage.removeItem('checkout_form'); localStorage.removeItem('checkout_payment') } catch {}
        setOrdered(true)
      } else if (payment === 'card') {
        await startCardPayment(docRef.id, orderItems)
      } else {
        setShowBank(true)
      }
    } catch (err) {
      toast.error(isAr ? 'حدث خطأ' : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleBankDone() {
    setShowBank(false)
    const pricing = { subtotal: total, shipping, discount, total: finalTotal }
    const orderItems = items.map(i => ({ id: i.id, productId: i.productId || i.id, name: i.name, size: i.size, price: i.price, priceTRY: i.price, qty: i.qty, image: i.image || null }))
    try {
      await Promise.all([
        sendOrderConfirmEmail({ customer: { uid: user.uid, ...form }, orderNumber, items: orderItems, pricing, pricingTRY: pricing, payment: { method: 'transfer' }, createdAt: new Date().toISOString() }),
        sendAdminNewOrderEmail({ orderNumber, customer: { uid: user.uid, ...form }, items: orderItems, pricing, pricingTRY: pricing, payment: { method: 'transfer' }, createdAt: new Date().toISOString() }),
      ])
    } catch (emailErr) { console.error('Transfer order email failed:', emailErr) }
    clearCart()
    try { localStorage.removeItem('checkout_form'); localStorage.removeItem('checkout_payment') } catch {}
    setOrdered(true)
  }

  const [cardContent, setCardContent] = useState('')

  async function startCardPayment(docId, orderItems) {
    setCardError('')
    setShowCard(true)
    setCardContent('')
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 20000)
    try {
      const res = await fetch(IYZICO_INIT_URL, {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: docId,
          currency: 'TRY',
          items: orderItems.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
          shipping,
          paidTotal: finalTotal,
          buyer: {
            uid: user?.uid || null,
            firstName: form.firstName, lastName: form.lastName,
            email: form.email, phone: form.phone,
            city: form.city, country: form.country,
            address: [form.district, form.neighborhood, form.address].filter(Boolean).join('، '),
          },
          address: {
            full: [form.district, form.neighborhood, form.address].filter(Boolean).join('، '),
            city: form.city, country: form.country,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkoutFormContent) {
        setCardError(data.error || (isAr ? 'تعذّر بدء الدفع' : 'Could not start payment'))
        return
      }
      setCardContent(data.checkoutFormContent)
    } catch (e) {
      setCardError(
        e?.name === 'AbortError'
          ? (isAr ? 'بوابة الدفع تستغرق وقتاً أطول من المعتاد. أعِد المحاولة من فضلك.' : 'The payment gateway is taking longer than usual. Please try again.')
          : (isAr ? 'تعذّر الاتصال ببوابة الدفع' : 'Payment gateway connection failed')
      )
    } finally {
      clearTimeout(timer)
    }
  }

  if (ordered) return <OrderSuccess orderNumber={orderNumber} email={form.email} />
  if (!items.length) return (
    <div style={{ background: '#F5E6D3', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <FiShoppingBag size={52} color="#E2C9A8" />
        <h2 style={{ color: '#3E1C00', fontFamily: 'Amiri, serif', margin: '16px 0 12px' }}>{t('cart.empty')}</h2>
        <Link to="/products" style={{ background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '12px 28px', borderRadius: 50, fontWeight: 700, textDecoration: 'none' }}>{t('cart.continue')}</Link>
      </div>
    </div>
  )

  const stepLabels = isAr
    ? ['التفاصيل', 'الدفع', 'المراجعة']
    : ['Details', 'Payment', 'Review']

  return (
    <div style={{ background: '#F5E6D3', minHeight: '100vh' }}>
      {showBank && <BankSheet orderNumber={orderNumber} orderId={orderId} total={formatPrice(finalTotal)} isAr={isAr} onConfirm={handleBankDone} onClose={() => setShowBank(false)} />}
      {showCard && <CardSheet content={cardContent} error={cardError} isAr={isAr} onClose={() => { setShowCard(false); setCardContent('') }} />}

      {/* شريط التقدم */}
      <div style={{ background: '#fff', padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
            {[1, 2, 3].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: step > s ? '#16A34A' : step === s ? 'linear-gradient(135deg, #7b192c, #a82040)' : '#E2C9A8',
                    color: step >= s ? '#fff' : '#9C6B4E',
                    fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.3s',
                  }}>
                    {step > s ? <FiCheck size={16} /> : s}
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: step === s ? '#7b192c' : '#9C6B4E', whiteSpace: 'nowrap' }}>{stepLabels[i]}</span>
                </div>
                {i < 2 && <div style={{ width: 50, height: 2, background: step > s ? '#16A34A' : '#E2C9A8', margin: '0 4px 18px', transition: 'background 0.3s' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '16px 12px 80px' }}>

        {/* ═══ المرحلة 1: التفاصيل ═══ */}
        {step === 1 && (
          <div>
            <h2 style={{ color: '#1a0610', fontFamily: 'Amiri, serif', fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiMapPin size={18} color="#7b192c" />
              {isAr ? 'تفاصيل التوصيل' : 'Delivery Details'}
            </h2>

            <div style={{ background: '#fff', borderRadius: 20, padding: '20px 18px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 2 }}>

              <Field label={isAr ? 'الدولة *' : 'Country *'} error={errors.country}>
                <CountryDropdown value={form.country} onChange={v => { setForm(f => ({ ...f, country: v })); setErrors(e => ({ ...e, country: '' })) }} isAr={isAr} />
                {form.country && shippingResult.found && (
                  <div style={{ marginTop: 8, background: shippingResult.price === 0 ? '#F0FDF4' : '#EFF6FF', borderRadius: 10, padding: '8px 14px', display: 'flex', justifyContent: 'space-between', border: `1px solid ${shippingResult.price === 0 ? '#BBF7D0' : '#BFDBFE'}` }}>
                    <span style={{ color: shippingResult.price === 0 ? '#16A34A' : '#2563EB', fontSize: '0.8rem', fontWeight: 600 }}>
                      {COUNTRY_LIST.find(c => c.ar === form.country)?.flag} {form.country}
                    </span>
                    <span style={{ color: shippingResult.price === 0 ? '#16A34A' : '#1E40AF', fontSize: '0.8rem', fontWeight: 700 }}>
                      {shippingResult.price === 0 ? '🎉 شحن مجاني' : formatPrice(shippingResult.price)} — {shippingResult.days} {isAr ? 'أيام' : 'days'}
                    </span>
                  </div>
                )}
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label={isAr ? 'الاسم الأول *' : 'First Name *'} error={errors.firstName}>
                  <Input value={form.firstName} onChange={v => { setForm(f => ({ ...f, firstName: v })); setErrors(e => ({ ...e, firstName: '' })) }} placeholder="" />
                </Field>
                <Field label={isAr ? 'الاسم الأخير' : 'Last Name'}>
                  <Input value={form.lastName} onChange={v => setForm(f => ({ ...f, lastName: v }))} placeholder="" />
                </Field>
              </div>

              <Field label={isAr ? 'العنوان' : 'Address'}>
                <Input value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder={isAr ? 'شارع، حي...' : 'Street, District...'} />
              </Field>

              <Field label={isAr ? 'المدينة' : 'City'}>
                <Input value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} placeholder="" />
              </Field>

              <Field label={isAr ? 'رقم الهاتف *' : 'Phone *'} error={errors.phone}>
                <Input value={form.phone} onChange={v => { setForm(f => ({ ...f, phone: v })); setErrors(e => ({ ...e, phone: '' })) }} type="tel" placeholder="" />
              </Field>

              <Field label={isAr ? 'البريد الإلكتروني *' : 'Email *'} error={errors.email}>
                <Input value={form.email} onChange={v => { setForm(f => ({ ...f, email: v })); setErrors(e => ({ ...e, email: '' })) }} type="email" placeholder="" />
              </Field>
            </div>

            <button onClick={goNext} style={{ width: '100%', marginTop: 20, background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '16px 0', borderRadius: 16, fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(123,25,44,0.3)' }}>
              {isAr ? 'متابعة' : 'Continue'}
              <FiChevronLeft size={18} />
            </button>
            <CartBar items={items} updateQty={updateQty} removeItem={removeItem} formatPrice={formatPrice} isAr={isAr} />
          </div>
        )}

        {/* ═══ المرحلة 2: الدفع ═══ */}
        {step === 2 && (
          <div>
            <h2 style={{ color: '#1a0610', fontFamily: 'Amiri, serif', fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiCreditCard size={18} color="#7b192c" />
              {isAr ? 'طريقة الدفع' : 'Payment Method'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* بطاقة ائتمان — دفع آمن داخل الموقع (الخيار الأول) */}
              <button onClick={() => setPayment('card')} style={{ background: payment === 'card' ? '#fdf0f2' : '#fff', border: `2px solid ${payment === 'card' ? '#7b192c' : '#E2C9A8'}`, borderRadius: 18, padding: '18px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'Amiri, serif', transition: 'all 0.15s', textAlign: 'right', position: 'relative' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: payment === 'card' ? 'rgba(123,25,44,0.1)' : '#F5E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiCreditCard size={20} color={payment === 'card' ? '#7b192c' : '#9C6B4E'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ color: '#1a0610', fontWeight: 700, fontSize: '0.95rem' }}>{isAr ? 'بطاقة ائتمان' : 'Credit Card'}</p>
                    <span style={{ background: '#2563EB', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '2px 9px', borderRadius: 50, letterSpacing: 0.5 }}>{isAr ? 'دفع آمن' : 'Secure'}</span>
                  </div>
                  <p style={{ color: '#9C6B4E', fontSize: '0.78rem', marginTop: 2 }}>{isAr ? 'ادفع بأمان داخل الموقع' : 'Pay securely on-site'}</p>
                </div>
                {payment === 'card' && <FiCheck size={18} color="#7b192c" />}
              </button>

              {/* تحويل بنكي */}
              <button onClick={() => setPayment('transfer')} style={{ background: payment === 'transfer' ? '#fdf0f2' : '#fff', border: `2px solid ${payment === 'transfer' ? '#7b192c' : '#E2C9A8'}`, borderRadius: 18, padding: '18px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'Amiri, serif', transition: 'all 0.15s', textAlign: 'right' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: payment === 'transfer' ? 'rgba(123,25,44,0.1)' : '#F5E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiBriefcase size={20} color={payment === 'transfer' ? '#7b192c' : '#9C6B4E'} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#1a0610', fontWeight: 700, fontSize: '0.95rem' }}>{isAr ? 'تحويل بنكي' : 'Bank Transfer'}</p>
                  <p style={{ color: '#9C6B4E', fontSize: '0.78rem', marginTop: 2 }}>{isAr ? 'حوّل وأرسل الإيصالَ' : 'Transfer and send receipt'}</p>
                </div>
                {payment === 'transfer' && <FiCheck size={18} color="#7b192c" />}
              </button>

              {/* الدفع عند التسليم */}
              <button onClick={() => setPayment('cod')} style={{ background: payment === 'cod' ? '#fdf0f2' : '#fff', border: `2px solid ${payment === 'cod' ? '#7b192c' : '#E2C9A8'}`, borderRadius: 18, padding: '18px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'Amiri, serif', transition: 'all 0.15s', textAlign: 'right', position: 'relative' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: payment === 'cod' ? 'rgba(123,25,44,0.1)' : '#F5E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiTruck size={20} color={payment === 'cod' ? '#7b192c' : '#9C6B4E'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ color: '#1a0610', fontWeight: 700, fontSize: '0.95rem' }}>{isAr ? 'الدفع عند التّسليم' : 'Cash on Delivery'}</p>
                    <span style={{ background: '#16A34A', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '2px 9px', borderRadius: 50, letterSpacing: 0.5 }}>{isAr ? 'متاح' : 'Available'}</span>
                  </div>
                  <p style={{ color: '#9C6B4E', fontSize: '0.78rem', marginTop: 2 }}>{isAr ? 'ادفع نقداً عند استلام طلبك' : 'Pay in cash when your order arrives'}</p>
                </div>
                {payment === 'cod' && <FiCheck size={18} color="#7b192c" />}
              </button>

              {/* قريباً */}
              {[
                { id: 'paypal', Icon: FiDollarSign, label_ar: 'PayPal',        label_en: 'PayPal'       },
                { id: 'apple',  Icon: FiSmartphone, label_ar: 'Apple Pay',     label_en: 'Apple Pay'    },
              ].map(pm => (
                <div key={pm.id} style={{ background: '#FAFAFA', border: '2px solid #F0E0D0', borderRadius: 18, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, opacity: 0.55 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F5E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <pm.Icon size={20} color="#9C6B4E" />
                  </div>
                  <span style={{ color: '#9C6B4E', fontWeight: 500, fontSize: '0.92rem', fontFamily: 'Amiri, serif', flex: 1 }}>{isAr ? pm.label_ar : pm.label_en}</span>
                  <span style={{ background: '#F5E6D3', color: '#9C6B4E', fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 50 }}>{isAr ? 'قريباً' : 'Soon'}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20, marginBottom: 70 }}>
              <button onClick={() => setStep(1)} style={{ flex: 0, background: '#fff', border: '2px solid #E2C9A8', borderRadius: 16, padding: '15px 20px', cursor: 'pointer', color: '#9C6B4E', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Amiri, serif', fontWeight: 600 }}>
                <FiChevronRight size={16} />
              </button>
              <button onClick={goNext} style={{ flex: 1, background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '15px 0', borderRadius: 16, fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(123,25,44,0.3)' }}>
                {isAr ? 'متابعة' : 'Continue'} <FiChevronLeft size={18} />
              </button>
            </div>
            <CartBar items={items} updateQty={updateQty} removeItem={removeItem} formatPrice={formatPrice} isAr={isAr} />
          </div>
        )}

        {/* ═══ المرحلة 3: المراجعة ═══ */}
        {step === 3 && (
          <div>
            <h2 style={{ color: '#1a0610', fontFamily: 'Amiri, serif', fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiShoppingBag size={18} color="#7b192c" />
              {isAr ? 'مراجعة الطّلب' : 'Review Order'}
            </h2>

            {/* ملخص البيانات */}
            <div style={{ background: '#fff', borderRadius: 18, padding: '16px 18px', marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <p style={{ color: '#1a0610', fontWeight: 700, fontSize: '0.88rem' }}>{isAr ? 'بيانات التوصيل' : 'Delivery Info'}</p>
                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#7b192c', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, fontFamily: 'Amiri, serif' }}>{isAr ? 'تعديل' : 'Edit'}</button>
              </div>
              <p style={{ color: '#6B3A2A', fontSize: '0.85rem' }}>{form.firstName} {form.lastName}</p>
              <p style={{ color: '#9C6B4E', fontSize: '0.8rem' }}>{[form.district, form.neighborhood, form.address].filter(Boolean).join('، ')}</p>
              <p style={{ color: '#9C6B4E', fontSize: '0.8rem' }}>{[form.city, form.country].filter(Boolean).join('، ')}</p>
              <p style={{ color: '#9C6B4E', fontSize: '0.8rem' }}>{form.phone} | {form.email}</p>
            </div>

            {/* طريقة الدفع */}
            <div style={{ background: '#fff', borderRadius: 18, padding: '16px 18px', marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(123,25,44,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {payment === 'cod' ? <FiTruck size={18} color="#7b192c" /> : <FiCreditCard size={18} color="#7b192c" />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#1a0610', fontWeight: 700, fontSize: '0.85rem' }}>{isAr ? 'طريقة الدفع' : 'Payment Method'}</p>
                <p style={{ color: '#9C6B4E', fontSize: '0.8rem', marginTop: 2 }}>
                  {payment === 'cod' ? (isAr ? 'الدفع عند التّسليم' : 'Cash on Delivery') : (isAr ? 'بطاقة ائتمان' : 'Credit Card')}
                </p>
              </div>
              <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: '#7b192c', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, fontFamily: 'Amiri, serif' }}>{isAr ? 'تعديل' : 'Edit'}</button>
            </div>

            {/* المنتجات */}
            <div style={{ background: '#fff', borderRadius: 18, padding: '16px 18px', marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <p style={{ color: '#1a0610', fontWeight: 700, fontSize: '0.88rem', marginBottom: 12 }}>{isAr ? 'المنتجات' : 'Items'} ({items.length})</p>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10, marginBottom: 10, borderBottom: i < items.length - 1 ? '1px solid #F5E6D3' : 'none' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: '#F5E6D3', flexShrink: 0, overflow: 'hidden' }}>
                    {item.image && <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#1a0610', fontWeight: 600, fontSize: '0.85rem' }}>{item.name}</p>
                    <p style={{ color: '#9C6B4E', fontSize: '0.75rem' }}>{item.size} × {item.qty}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <p style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.88rem' }}>{formatPrice(item.price * item.qty)}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => updateQty(item.id, item.size, item.qty - 1)} style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid #E2C9A8', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1a0610' }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.size, item.qty + 1)} style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid #E2C9A8', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* كوبون */}
            <div style={{ background: '#fff', borderRadius: 18, padding: '16px 18px', marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <p style={{ color: '#1a0610', fontWeight: 700, fontSize: '0.85rem', marginBottom: 10 }}>{isAr ? 'كوبون الخصم' : 'Discount Coupon'}</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                <input value={coupon} onChange={e => { setCoupon(e.target.value); setCouponError('') }}
                  placeholder="AROMENA10" disabled={couponApplied}
                  style={{ flex: 1, minWidth: 0, padding: '12px 14px', borderRadius: 12, border: `2px solid ${couponError ? '#DC2626' : '#E2C9A8'}`, fontSize: '0.85rem', outline: 'none', fontFamily: 'Amiri, serif', background: '#FFFBF5', boxSizing: 'border-box' }} />
                <button onClick={applyCoupon} disabled={couponApplied} style={{
                  flexShrink: 0, width: 72,
                  background: couponApplied ? '#16A34A' : 'linear-gradient(to left, #7b192c, #a82040)',
                  color: couponApplied ? '#fff' : '#f4be69',
                  padding: '12px 0', borderRadius: 12, fontWeight: 700,
                  fontSize: '0.82rem', border: 'none',
                  cursor: couponApplied ? 'not-allowed' : 'pointer',
                  fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {couponApplied ? <FiCheck size={15} /> : (isAr ? 'تطبيق' : 'Apply')}
                </button>
              </div>
              {couponError && <p style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: 6 }}>{couponError}</p>}
              {couponApplied && <p style={{ color: '#16A34A', fontSize: '0.78rem', marginTop: 6, fontWeight: 600 }}>✓ {isAr ? 'خصم مطبّق!' : 'Discount applied!'}</p>}
            </div>

            {/* المجموع */}
            <div style={{ background: '#fff', borderRadius: 18, padding: '16px 18px', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9C6B4E', fontSize: '0.88rem' }}>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span style={{ color: '#1a0610', fontWeight: 600 }}>{formatPrice(total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9C6B4E', fontSize: '0.88rem' }}>{isAr ? 'الشّحن' : 'Shipping'}</span>
                  <span style={{ color: shipping === 0 ? '#16A34A' : '#1a0610', fontWeight: 600 }}>
                    {!form.country ? (isAr ? '—' : '—') : shipping === 0 ? (isAr ? 'مجاني ✓' : 'Free ✓') : formatPrice(shipping)}
                  </span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9C6B4E', fontSize: '0.88rem' }}>{isAr ? 'الخصم' : 'Discount'}</span>
                    <span style={{ color: '#16A34A', fontWeight: 600 }}>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '2px solid #F5E6D3' }}>
                  <span style={{ color: '#1a0610', fontWeight: 700, fontSize: '1rem' }}>{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span style={{ color: '#7b192c', fontWeight: 900, fontSize: '1.2rem' }}>{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            {/* الموافقة */}
            <button onClick={() => setAgreed(!agreed)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, fontFamily: 'Amiri, serif', padding: 0, width: '100%' }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${agreed ? '#7b192c' : '#E2C9A8'}`, background: agreed ? '#7b192c' : '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {agreed && <FiCheck size={13} color="#fff" />}
              </div>
              <span style={{ color: '#6B3A2A', fontSize: '0.82rem', textAlign: 'right' }}>{t('checkout.terms')}</span>
            </button>

            {/* الأزرار */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(2)} style={{ flex: 0, background: '#fff', border: '2px solid #E2C9A8', borderRadius: 16, padding: '15px 20px', cursor: 'pointer', color: '#9C6B4E', display: 'flex', alignItems: 'center', fontFamily: 'Amiri, serif' }}>
                <FiChevronRight size={16} />
              </button>
              <button onClick={handleOrder} disabled={!agreed || loading} style={{
                flex: 1, background: agreed && !loading ? 'linear-gradient(to left, #7b192c, #a82040)' : '#E2C9A8',
                color: agreed && !loading ? '#f4be69' : '#9C6B4E',
                padding: '15px 0', borderRadius: 16, fontWeight: 700, fontSize: '1rem',
                border: 'none', cursor: agreed && !loading ? 'pointer' : 'not-allowed',
                fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: agreed && !loading ? '0 6px 20px rgba(123,25,44,0.3)' : 'none',
              }}>
                <FiShoppingBag size={18} />
                {loading ? (isAr ? 'جاري التحضير...' : 'Processing...') : (isAr ? 'تأكيد الطّلب' : 'Place Order')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}