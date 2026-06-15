import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { FiCheck, FiGlobe, FiMail, FiPhone, FiInstagram, FiUpload, FiX, FiSave, FiActivity, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { uploadImage } from '../../utils/cloudinary'
import { db } from '../../firebase'
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore'

const BORDEAUX = '#7b192c'
const GOLD     = '#f4be69'
const BG       = '#F5E6D3'
const BG2      = '#EDD9C0'
const CARD     = '#ffffff'
const TEXT     = '#3E1C00'
const TEXT2    = '#9C6B4E'
const BORDER   = '#E2C9A8'

const defaultSettings = {
  site_name:         'Aromena Spices',
  site_name_ar:      'أرومينا للبهارات',
  tagline_ar:        'بهارات أصيلة من قلب الشرق',
  tagline_en:        'Authentic Spices from the Heart of the East',
  email:             'aromena.official@gmail.com',
  whatsapp:          '+905550044476',
  phone:             '+905550044476',
  instagram:         'aromena.official',
  tiktok:            'aromena.official',
  domain:            'aromina.com.tr',
  return_policy_days: 14,
  vat_enabled:       false,
  chat_name:         'Adam',
  chat_email:        'aromena.official@gmail.com',
  chat_welcome_ar:   'أهلاً! كيف أقدر أساعدك؟',
  chat_welcome_en:   'Hello! How can I help you?',
  hero_title_ar:     'بهارات أصيلة',
  hero_title_en:     'Authentic Spices',
  hero_subtitle_ar:  'سرّ النّكهة الّلي بتشبه بيتنا',
  hero_subtitle_en:  'From the Heart of the East to Your Kitchen',
  logo_url:          null,
  owner_photo_url:   null,
  slider_images:     [],
  ticker_items: [
    '🌶️ بهارات أصيلة من قلب الشرق',
    '🚚 شحن سريع لأوروبّا والخليج',
    '✨ جودة مضمونة 100%',
    '🎁 باقات هدايا مميزة',
    '🌿 طبيعي بدون مواد حافظة',
  ],
}

const inputStyle = {
  width: '100%', padding: '10px 12px',
  borderRadius: 10, border: `2px solid ${BORDER}`,
  fontSize: '0.88rem', color: TEXT,
  fontFamily: 'Tajawal, sans-serif', outline: 'none',
  background: '#FFFBF5', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  color: TEXT, fontSize: '0.82rem',
  fontWeight: 600, display: 'block', marginBottom: 5,
}

function Section({ title, children }) {
  return (
    <div style={{
      background: CARD, borderRadius: 20,
      border: `1px solid ${BORDER}`,
      padding: '22px 24px', marginBottom: 18,
      boxShadow: '0 2px 12px rgba(62,28,0,0.05)',
    }}>
      <h3 style={{
        color: TEXT, fontWeight: 700, fontSize: '0.96rem',
        marginBottom: 18, paddingBottom: 12,
        borderBottom: `1px solid ${BG}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>{title}</h3>
      {children}
    </div>
  )
}

function FocusInput({ value, onChange, ...props }) {
  return (
    <input
      value={value}
      onChange={onChange}
      style={inputStyle}
      onFocus={e => e.target.style.borderColor = BORDEAUX}
      onBlur={e => e.target.style.borderColor = BORDER}
      {...props}
    />
  )
}

export default function AdminSettings() {
  const [settings,        setSettings]        = useState(defaultSettings)
  const [loading,         setLoading]         = useState(true)
  const [saving,          setSaving]          = useState(false)
  const [saved,           setSaved]           = useState(false)
  const [uploadingLogo,   setUploadingLogo]   = useState(false)
  const [uploadingOwner,  setUploadingOwner]  = useState(false)
  const [logoProgress,    setLogoProgress]    = useState(0)
  const [ownerProgress,   setOwnerProgress]   = useState(0)
  const [uploadingSlider, setUploadingSlider] = useState(false)
  const [sliderProgress,  setSliderProgress]  = useState(0)

  // سجلّ النشاط
  const [activity, setActivity] = useState([])
  const [loadingActivity, setLoadingActivity] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'main'))
        if (snap.exists()) setSettings({ ...defaultSettings, ...snap.data() })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
    loadActivity()
  }, [])

  async function loadActivity() {
    setLoadingActivity(true)
    try {
      const q = query(collection(db, 'activity_log'), orderBy('at', 'desc'), limit(30))
      const snap = await getDocs(q)
      setActivity(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingActivity(false)
    }
  }

  function fmtDate(ts) {
    if (!ts) return '—'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
  }

  function shortUA(ua) {
    if (!ua) return 'غير معروف'
    if (/iPhone|iPad/.test(ua)) return 'iOS'
    if (/Android/.test(ua)) return 'Android'
    if (/Windows/.test(ua)) return 'Windows'
    if (/Mac/.test(ua)) return 'Mac'
    if (/Linux/.test(ua)) return 'Linux'
    return 'متصفّح'
  }

  async function handleSave() {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'main'), settings)
      setSaved(true)
      toast.success('تم حفظ الإعدادات!')
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      toast.error('فشل الحفظ: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpload(file, key, setUploading, setProgress) {
    if (!file) return
    setUploading(true)
    setProgress(0)
    try {
      const url = await uploadImage(file, p => setProgress(p))
      setSettings(s => ({ ...s, [key]: url }))
    } catch {
      toast.error('فشل رفع الصورة، حاول مرة ثانية')
    } finally {
      setUploading(false)
    }
  }

  async function handleSliderUpload(file) {
    if (!file) return
    if ((settings.slider_images || []).length >= 6) {
      toast.error('الحد الأقصى 6 صور')
      return
    }
    setUploadingSlider(true)
    setSliderProgress(0)
    try {
      const url = await uploadImage(file, p => setSliderProgress(p))
      setSettings(s => ({ ...s, slider_images: [...(s.slider_images || []), url] }))
    } catch {
      toast.error('فشل رفع الصورة')
    } finally {
      setUploadingSlider(false)
    }
  }

  function removeSliderImage(idx) {
    setSettings(s => ({
      ...s,
      slider_images: (s.slider_images || []).filter((_, i) => i !== idx),
    }))
  }

  function update(key, value) {
    setSettings(s => ({ ...s, [key]: value }))
  }

  function ImageUploader({ label, imageKey, uploading, setUploading, progress, setProgress }) {
    return (
      <div>
        <label style={labelStyle}>{label}</label>
        <div
          onClick={() => document.getElementById(`upload-${imageKey}`).click()}
          style={{
            border: `2px dashed ${BORDER}`, borderRadius: 14,
            padding: '20px', textAlign: 'center',
            background: '#FFFBF5', cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = BORDEAUX}
          onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
        >
          {settings[imageKey] ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={settings[imageKey]} alt={label} style={{
                width: imageKey === 'logo_url' ? 160 : 100,
                height: 100, borderRadius: 12, objectFit: 'contain',
                background: imageKey === 'logo_url' ? BG : 'transparent',
                padding: imageKey === 'logo_url' ? 8 : 0,
              }} />
              <button onClick={e => { e.stopPropagation(); update(imageKey, null) }} style={{
                position: 'absolute', top: -8, left: -8,
                width: 24, height: 24, borderRadius: '50%',
                background: '#DC2626', border: 'none',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FiX size={12} />
              </button>
            </div>
          ) : uploading ? (
            <div>
              <div style={{
                background: BG, borderRadius: 50,
                height: 8, overflow: 'hidden', margin: '0 auto 8px', maxWidth: 200,
              }}>
                <div style={{
                  height: '100%', width: `${progress}%`,
                  background: `linear-gradient(to left, ${BORDEAUX}, #a82040)`,
                  borderRadius: 50, transition: 'width 0.3s',
                }} />
              </div>
              <p style={{ color: BORDEAUX, fontSize: '0.85rem', fontWeight: 700 }}>{progress}%</p>
            </div>
          ) : (
            <div>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(123,25,44,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px',
              }}>
                <FiUpload size={20} color={BORDEAUX} />
              </div>
              <p style={{ color: TEXT2, fontSize: '0.83rem' }}>اضغط لرفع الصورة</p>
            </div>
          )}
          <input
            id={`upload-${imageKey}`}
            type="file" accept="image/*"
            style={{ display: 'none' }}
            onChange={e => handleUpload(e.target.files[0], imageKey, setUploading, setProgress)}
          />
        </div>
      </div>
    )
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ height: 120, borderRadius: 20, background: BG, animation: 'pulse 1.2s ease-in-out infinite' }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', color: TEXT, fontFamily: 'Tajawal, sans-serif' }}>الإعدادات</h1>
          <p style={{ color: TEXT2, fontSize: '0.85rem' }}>إعدادات الموقع العامة</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{
          background: saved
            ? '#16A34A'
            : saving
              ? BG2
              : `linear-gradient(to left, ${BORDEAUX}, #a82040)`,
          color: saved ? '#fff' : saving ? TEXT2 : GOLD,
          padding: '10px 24px', borderRadius: 50,
          fontWeight: 700, fontSize: '0.88rem',
          border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'Tajawal, sans-serif',
          boxShadow: saved || saving ? 'none' : '0 4px 14px rgba(123,25,44,0.25)',
          transition: 'all 0.3s',
        }}>
          {saved ? <FiCheck size={16} /> : <FiSave size={16} />}
          {saved ? 'تم الحفظ!' : saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      {/* الصور والهوية */}
      <Section title="🖼️ الصور والهوية البصرية">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <ImageUploader
            label="لوغو الموقع"
            imageKey="logo_url"
            uploading={uploadingLogo}
            setUploading={setUploadingLogo}
            progress={logoProgress}
            setProgress={setLogoProgress}
          />
          <ImageUploader
            label="صورة صاحبة المتجر (غالية)"
            imageKey="owner_photo_url"
            uploading={uploadingOwner}
            setUploading={setUploadingOwner}
            progress={ownerProgress}
            setProgress={setOwnerProgress}
          />
        </div>
      </Section>

      {/* معرض الصور */}
      <Section title="🖼️ معرض الصور — الصفحة الرئيسية (حتى 6 صور)">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          {(settings.slider_images || []).map((img, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <img src={img} alt="" style={{
                width: 100, height: 100, borderRadius: 12,
                objectFit: 'cover',
                border: idx === 0 ? `3px solid ${BORDEAUX}` : `2px solid ${BORDER}`,
              }} />
              {idx === 0 && (
                <span style={{
                  position: 'absolute', bottom: -8, left: '50%',
                  transform: 'translateX(-50%)',
                  background: BORDEAUX, color: GOLD,
                  fontSize: '0.58rem', padding: '2px 6px',
                  borderRadius: 50, whiteSpace: 'nowrap',
                  fontWeight: 700,
                }}>أولى</span>
              )}
              <button onClick={() => removeSliderImage(idx)} style={{
                position: 'absolute', top: -8, right: -8,
                width: 22, height: 22, borderRadius: '50%',
                background: '#DC2626', border: 'none', color: '#fff',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FiX size={10} />
              </button>
            </div>
          ))}

          {(settings.slider_images || []).length < 6 && (
            <div
              onClick={() => document.getElementById('slider-upload').click()}
              style={{
                width: 100, height: 100, borderRadius: 12,
                border: `2px dashed ${BORDER}`, background: '#FFFBF5',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', gap: 4,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = BORDEAUX}
              onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
            >
              {uploadingSlider ? (
                <p style={{ color: BORDEAUX, fontSize: '0.75rem', fontWeight: 700 }}>{sliderProgress}%</p>
              ) : (
                <>
                  <FiUpload size={18} color={BORDEAUX} />
                  <span style={{ fontSize: '0.65rem', color: TEXT2, marginTop: 2 }}>إضافة</span>
                </>
              )}
            </div>
          )}
        </div>
        <input
          id="slider-upload" type="file" accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleSliderUpload(e.target.files[0])}
        />
        <p style={{ color: TEXT2, fontSize: '0.78rem' }}>
          💡 الصورة الأولى هي البداية — يمكنك إضافة حتى 6 صور تتنقل تلقائياً
        </p>
      </Section>

      {/* معلومات الموقع */}
      <Section title="🏪 معلومات الموقع">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>اسم الموقع بالعربي</label>
              <FocusInput value={settings.site_name_ar} onChange={e => update('site_name_ar', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>اسم الموقع بالإنجليزي</label>
              <FocusInput value={settings.site_name} onChange={e => update('site_name', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>الشعار الفرعي بالعربي</label>
              <FocusInput value={settings.tagline_ar} onChange={e => update('tagline_ar', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>الشعار الفرعي بالإنجليزي</label>
              <FocusInput value={settings.tagline_en} onChange={e => update('tagline_en', e.target.value)} />
            </div>
          </div>
          <div>
            <label style={labelStyle}><FiGlobe size={12} style={{ marginLeft: 4 }} /> الدومين</label>
            <FocusInput value={settings.domain} onChange={e => update('domain', e.target.value)} />
          </div>
        </div>
      </Section>

      {/* الهيرو */}
      <Section title="🎯 قسم الهيرو">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>العنوان الرئيسي بالعربي</label>
              <FocusInput value={settings.hero_title_ar} onChange={e => update('hero_title_ar', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>العنوان الرئيسي بالإنجليزي</label>
              <FocusInput value={settings.hero_title_en} onChange={e => update('hero_title_en', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>العنوان الفرعي بالعربي</label>
              <FocusInput value={settings.hero_subtitle_ar} onChange={e => update('hero_subtitle_ar', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>العنوان الفرعي بالإنجليزي</label>
              <FocusInput value={settings.hero_subtitle_en} onChange={e => update('hero_subtitle_en', e.target.value)} />
            </div>
          </div>
        </div>
      </Section>

      {/* معلومات التواصل */}
      <Section title="📞 معلومات التواصل">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}><FiMail size={12} style={{ marginLeft: 4 }} /> الإيميل</label>
            <FocusInput value={settings.email} onChange={e => update('email', e.target.value)} type="email" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}><FiPhone size={12} style={{ marginLeft: 4 }} /> واتساب</label>
              <FocusInput value={settings.whatsapp} onChange={e => update('whatsapp', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>هاتف</label>
              <FocusInput value={settings.phone} onChange={e => update('phone', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}><FiInstagram size={12} style={{ marginLeft: 4 }} /> Instagram</label>
              <FocusInput value={settings.instagram} onChange={e => update('instagram', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>TikTok</label>
              <FocusInput value={settings.tiktok} onChange={e => update('tiktok', e.target.value)} />
            </div>
          </div>
        </div>
      </Section>

      {/* شريط الإعلانات */}
      <Section title="📢 شريط الإعلانات">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(settings.ticker_items || []).map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <FocusInput
                value={item}
                onChange={e => {
                  const arr = [...(settings.ticker_items || [])]
                  arr[i] = e.target.value
                  update('ticker_items', arr)
                }}
              />
              <button
                onClick={() => update('ticker_items', (settings.ticker_items || []).filter((_, idx) => idx !== i))}
                style={{
                  background: '#FEE2E2', border: 'none', borderRadius: 8,
                  color: '#DC2626', cursor: 'pointer',
                  width: 38, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <FiX size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => update('ticker_items', [...(settings.ticker_items || []), '✨ نص جديد'])}
            style={{
              background: BG, border: `2px dashed ${BORDER}`,
              borderRadius: 10, padding: '10px', color: BORDEAUX,
              fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem',
              fontFamily: 'Tajawal, sans-serif', transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = BORDEAUX}
            onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
          >
            + إضافة نص
          </button>
        </div>
      </Section>

      {/* إعدادات أخرى */}
      <Section title="🔧 إعدادات أخرى">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>مدة سياسة الإرجاع (أيام)</label>
            <input
              type="number" min={1}
              value={settings.return_policy_days}
              onChange={e => update('return_policy_days', +e.target.value)}
              style={{ ...inputStyle, maxWidth: 160 }}
              onFocus={e => e.target.style.borderColor = BORDEAUX}
              onBlur={e => e.target.style.borderColor = BORDER}
            />
          </div>

          {/* Toggle VAT */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: BG, borderRadius: 12, padding: '14px 16px',
          }}>
            <button
              onClick={() => update('vat_enabled', !settings.vat_enabled)}
              style={{
                width: 46, height: 26, borderRadius: 50, flexShrink: 0,
                background: settings.vat_enabled
                  ? `linear-gradient(to left, ${BORDEAUX}, #a82040)`
                  : BORDER,
                border: 'none', cursor: 'pointer',
                position: 'relative', transition: 'background 0.3s',
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: CARD,
                position: 'absolute', top: 3,
                right: settings.vat_enabled ? 3 : 'auto',
                left: settings.vat_enabled ? 'auto' : 3,
                transition: 'all 0.3s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }} />
            </button>
            <div>
              <p style={{ color: TEXT, fontWeight: 700, fontSize: '0.88rem' }}>تفعيل الضريبة (VAT)</p>
              <p style={{ color: TEXT2, fontSize: '0.78rem' }}>
                {settings.vat_enabled ? 'مفعّل — يتم إضافة الضريبة حسب الدولة' : 'معطّل حالياً'}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ سجلّ النشاط — عمليّات الدخول ═══ */}
      <Section title={<><FiActivity size={15} color={BORDEAUX} /> سجلّ الدخول (آخر 30 محاولة)</>}>
        {loadingActivity ? (
          <p style={{ color: TEXT2, fontSize: '0.85rem' }}>جاري التحميل...</p>
        ) : activity.length === 0 ? (
          <p style={{ color: TEXT2, fontSize: '0.85rem' }}>لا توجد سجلّات بعد.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activity.map(a => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 12,
                background: a.success ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${a.success ? '#BBF7D0' : '#FECACA'}`,
              }}>
                {a.success
                  ? <FiCheckCircle size={18} color="#16A34A" style={{ flexShrink: 0 }} />
                  : <FiXCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: a.success ? '#15803D' : '#B91C1C', fontWeight: 700, fontSize: '0.85rem' }}>
                    {a.success ? 'دخول ناجح' : 'محاولة فاشلة'}
                  </span>
                  <span style={{ color: TEXT2, fontSize: '0.78rem', marginRight: 10 }}>· {shortUA(a.userAgent)}</span>
                </div>
                <span style={{ color: TEXT2, fontSize: '0.76rem', whiteSpace: 'nowrap' }}>{fmtDate(a.at)}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={loadActivity} style={{
          marginTop: 12, background: 'none', border: `1px solid ${BORDER}`,
          color: TEXT2, padding: '7px 16px', borderRadius: 10, fontSize: '0.8rem',
          cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
        }}>تحديث السجلّ</button>
      </Section>

      {/* زر الحفظ السفلي */}
      <button onClick={handleSave} disabled={saving} style={{
        width: '100%',
        background: saved
          ? '#16A34A'
          : saving ? BG2 : `linear-gradient(to left, ${BORDEAUX}, #a82040)`,
        color: saved ? '#fff' : saving ? TEXT2 : GOLD,
        padding: '14px 0', borderRadius: 14,
        fontWeight: 700, fontSize: '0.95rem',
        border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: 'Tajawal, sans-serif', transition: 'all 0.3s',
        boxShadow: saved || saving ? 'none' : '0 4px 16px rgba(123,25,44,0.2)',
      }}>
        {saved ? <FiCheck size={18} /> : <FiSave size={18} />}
        {saved ? 'تم حفظ الإعدادات!' : saving ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}
      </button>
    </div>
  )
}