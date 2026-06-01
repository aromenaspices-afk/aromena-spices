import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FiSend, FiUser, FiMail, FiPhone, FiMapPin,
  FiBriefcase, FiHome, FiChevronDown, FiChevronUp,
  FiCheckCircle, FiPackage, FiTruck, FiDollarSign, FiUsers
} from 'react-icons/fi'
import { SiWhatsapp } from 'react-icons/si'
import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { sendAdminNewOrderEmail } from '../utils/emailService'

const BENEFITS = [
  { icon: <FiDollarSign size={20} />, title_ar: 'أسعار الجملة', title_en: 'Wholesale Prices', desc_ar: 'أسعار تنافُسيّة خاصّة بكمّيّات الجّملة', desc_en: 'Competitive prices for bulk orders' },
  { icon: <FiTruck size={20} />, title_ar: 'شحن سريع', title_en: 'Fast Shipping', desc_ar: 'توصيل لكل أوروبّا والخليج وتركيّا', desc_en: 'Delivery across Europe, Gulf & Turkey' },
  { icon: <FiPackage size={20} />, title_ar: 'كمّيّات مرنة', title_en: 'Flexible Quantities', desc_ar: 'تلبية احتياجات عملك بأيّ كمّيّة', desc_en: 'Meeting your business needs at any volume' },
  { icon: <FiUsers size={20} />, title_ar: 'شراكة مُستدامة', title_en: 'Long-term Partnership', desc_ar: 'نبني علاقات تجاريُة طويلة الأمد', desc_en: 'We build long-term business relationships' },
]

const FAQ = [
  {
    q_ar: 'ما هي الكمية الدنيا للطلب؟',
    q_en: 'What is the minimum order quantity?',
    a_ar: 'الحد الأدنى للطلب هو 10 كيلوغرام من أي منتج، أو ما يعادل 500 يورو كحد أدنى للفاتورة.',
    a_en: 'The minimum order is 10 kg of any product, or a minimum invoice of €500.',
  },
  {
    q_ar: 'هل تشحنون لجميع الدول؟',
    q_en: 'Do you ship to all countries?',
    a_ar: 'نشحن حالياً لأوروبا وتركيا والخليج العربي والأردن. للدول الأخرى تواصل معنا مباشرة.',
    a_en: 'We currently ship to Europe, Turkey, the Gulf, and Jordan. For other countries, contact us directly.',
  },
  {
    q_ar: 'ما هي طرق الدفع المتاحة للجملة؟',
    q_en: 'What payment methods are available for wholesale?',
    a_ar: 'نقبل التحويل البنكي وبطاقات الائتمان وPayPal للطلبات الكبيرة. شروط الدفع تُحدد حسب كل عميل.',
    a_en: 'We accept bank transfer, credit cards, and PayPal for large orders. Payment terms are set per client.',
  },
  {
    q_ar: 'هل يمكنني طلب عينات قبل الشراء؟',
    q_en: 'Can I request samples before purchasing?',
    a_ar: 'نعم، نوفر عينات مجانية للعملاء الجادين مقابل تكلفة الشحن فقط.',
    a_en: 'Yes, we provide free samples for serious clients, you only pay shipping costs.',
  },
  {
    q_ar: 'هل تقدمون تغليفاً خاصاً بالعلامة التجارية؟',
    q_en: 'Do you offer private label packaging?',
    a_ar: 'نعم، نوفر خدمة التغليف بعلامتك التجارية الخاصة للكميات الكبيرة. تواصل معنا للتفاصيل.',
    a_en: 'Yes, we offer private label packaging for large quantities. Contact us for details.',
  },
  {
    q_ar: 'كم يستغرق وصول الطلب؟',
    q_en: 'How long does delivery take?',
    a_ar: 'عادةً 5-10 أيام عمل داخل أوروبا، و7-14 يوماً للخليج وتركيا، حسب الكمية والوجهة.',
    a_en: 'Usually 5-10 business days within Europe, 7-14 days for Gulf and Turkey, depending on quantity and destination.',
  },
]

const BUSINESS_TYPES = [
  { value: 'restaurant',  label_ar: 'مطعم',         label_en: 'Restaurant' },
  { value: 'trader',      label_ar: 'موزّع',  label_en: 'Trader / Distributor' },
  { value: 'supermarket', label_ar: 'سوبرماركت',    label_en: 'Supermarket' },
  { value: 'catering', label_ar: 'خدمات الطّعام', label_en: 'Catering' },
  { value: 'other',       label_ar: 'غيره',          label_en: 'Other' },
]

const STEPS = [
  { num: '01', title_ar: 'أرسل طلبك', title_en: 'Send Request', desc_ar: 'املأ النّموذج أدناه', desc_en: 'Fill the form below' },
  { num: '02', title_ar: 'نتواصل معك', title_en: 'We Contact You', desc_ar: 'خلال 24 ساعة', desc_en: 'Within 24 hours' },
  { num: '03', title_ar: 'نرسل العرض', title_en: 'We Send Offer', desc_ar: 'سعر وشروط مُخصّصة', desc_en: 'Custom price & terms' },
  { num: '04', title_ar: 'نبدأ الشحن', title_en: 'We Ship', desc_ar: 'نبدأ الشّحن', desc_en: 'Fast & safe' },
]

export default function Wholesale() {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  const [form, setForm] = useState({
    firstName: '', lastName: '', company: '', country: '',
    email: '', whatsapp: '', business: '', details: ''
  })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [step, setStep] = useState(1)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit() {
    if (!form.firstName || !form.email || !form.whatsapp || !form.business) {
      toast.error(isAr ? 'يرجى تعبئة الحقول المطلوبة' : 'Please fill required fields')
      return
    }
    setLoading(true)
    try {
      await addDoc(collection(db, 'wholesale'), {
        ...form,
        createdAt: new Date().toISOString(),
        status: 'pending',
      })
      setSent(true)
      setForm({ firstName: '', lastName: '', company: '', country: '', email: '', whatsapp: '', business: '', details: '' })
      toast.success(isAr ? 'تم إرسال طلبك!' : 'Request sent!')
    } catch (err) {
      toast.error(isAr ? 'حدث خطأ، حاول مرة ثانية' : 'Error, please try again')
    } finally {
      setLoading(false)
    }
  }

  const waUrl = 'https://wa.me/905550044476?text=' + encodeURIComponent(
    isAr ? 'مرحباً، أنا مهتم بطلبات الجملة من أرومينا' : 'Hello, I am interested in wholesale orders from Aromena'
  )

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    borderRadius: 12, border: '2px solid #E2C9A8',
    fontSize: '0.9rem', color: '#3E1C00',
    fontFamily: 'Amiri, serif', outline: 'none',
    background: '#FFFBF5', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const labelStyle = {
    color: '#3E1C00', fontSize: '0.83rem',
    fontWeight: 600, marginBottom: 6,
    display: 'flex', alignItems: 'center', gap: 5,
  }

  return (
    <div style={{ background: '#F5E6D3', minHeight: '100vh' }}>

      {/* ═══ HERO ═══ */}
      <div style={{ background: 'linear-gradient(135deg, #1a0610 0%, #7b192c 60%, #a82040 100%)', padding: '48px 20px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(244,190,105,0.06) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(244,190,105,0.12)', border: '1px solid rgba(244,190,105,0.25)', color: '#f4be69', padding: '5px 18px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600, letterSpacing: 1, marginBottom: 16 }}>
            B2B
          </div>
          <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', color: '#f4be69', fontFamily: 'Amiri, serif', marginBottom: 12 }}>
            {t('wholesale.title')}
          </h1>
          <p style={{ color: 'rgba(244,190,105,0.65)', fontSize: '0.9rem', lineHeight: 1.8, maxWidth: 480, margin: '0 auto 28px' }}>
            {t('wholesale.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#form" style={{ background: '#f4be69', color: '#7b192c', padding: '11px 28px', borderRadius: 50, fontWeight: 800, fontSize: '0.88rem', textDecoration: 'none' }}>
              {isAr ? 'أرسل طلباً' : 'Send Request'}
            </a>
            <a href={waUrl} target="_blank" rel="noreferrer" style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', color: '#4ade80', padding: '11px 24px', borderRadius: 50, fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <SiWhatsapp size={15} /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* ═══ BENEFITS ═══ */}
      <div style={{ background: '#fff', padding: '36px 16px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {BENEFITS.map((b, i) => (
            <div key={i} style={{ padding: '20px 16px', borderRadius: 16, border: '1px solid #E2C9A8', background: '#FFFBF5', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #7b192c, #a82040)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f4be69', flexShrink: 0 }}>
                {b.icon}
              </div>
              <div>
                <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.88rem', marginBottom: 4 }}>{isAr ? b.title_ar : b.title_en}</p>
                <p style={{ color: '#9C6B4E', fontSize: '0.76rem', lineHeight: 1.6 }}>{isAr ? b.desc_ar : b.desc_en}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ HOW IT WORKS ═══ */}
      <div style={{ padding: '40px 16px', background: '#EDD9C0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: '#3E1C00', fontFamily: 'Amiri, serif', fontSize: '1.4rem', marginBottom: 28 }}>
            {isAr ? 'كيف يعمل النّظام؟' : 'How Does It Work?'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '20px 14px', textAlign: 'center', border: '1px solid #E2C9A8', position: 'relative' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #7b192c, #a82040)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#f4be69', fontWeight: 900, fontSize: '0.78rem', letterSpacing: 1 }}>
                  {s.num}
                </div>
                <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.86rem', marginBottom: 4 }}>{isAr ? s.title_ar : s.title_en}</p>
                <p style={{ color: '#9C6B4E', fontSize: '0.75rem' }}>{isAr ? s.desc_ar : s.desc_en}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      

      {/* ═══ FORM ═══ */}
      <div id="form" style={{ padding: '40px 16px 60px', background: '#EDD9C0' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: '#3E1C00', fontFamily: 'Amiri, serif', fontSize: '1.4rem', marginBottom: 6 }}>
            {isAr ? 'أرسل طلب الجّملة' : 'Send Wholesale Request'}
          </h2>
          <p style={{ textAlign: 'center', color: '#9C6B4E', fontSize: '0.84rem', marginBottom: 24 }}>
            {isAr ? 'سنتواصل معك خلال 24 ساعة' : 'We will contact you within 24 hours'}
          </p>

          <div style={{ background: '#fff', borderRadius: 20, padding: '28px 20px', border: '1px solid #E2C9A8', boxShadow: '0 4px 24px rgba(123,25,44,0.07)' }}>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <FiCheckCircle size={32} color="#16A34A" />
                </div>
                <h3 style={{ color: '#16A34A', fontSize: '1.1rem', fontFamily: 'Amiri, serif', marginBottom: 10 }}>
                  {isAr ? 'تم إرسال طلبك بنجاح!' : 'Request Sent Successfully!'}
                </h3>
                <p style={{ color: '#9C6B4E', fontSize: '0.86rem', lineHeight: 1.8 }}>
                  {isAr ? 'سيتواصل معك فريقنا خلال 24 ساعة على البريد أو الواتساب.' : 'Our team will contact you within 24 hours via email or WhatsApp.'}
                </p>
                <button onClick={() => setSent(false)} style={{ marginTop: 20, background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '10px 24px', borderRadius: 50, fontWeight: 700, fontSize: '0.86rem', border: 'none', cursor: 'pointer', fontFamily: 'Amiri, serif' }}>
                  {isAr ? 'إرسال طلب آخر' : 'Send Another Request'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* الاسم */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}><FiUser size={12} color="#7b192c" />{t('wholesale.first_name')} *</label>
                    <input value={form.firstName} onChange={e => set('firstName', e.target.value)} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#7b192c'} onBlur={e => e.target.style.borderColor = '#E2C9A8'} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('wholesale.last_name')}</label>
                    <input value={form.lastName} onChange={e => set('lastName', e.target.value)} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#7b192c'} onBlur={e => e.target.style.borderColor = '#E2C9A8'} />
                  </div>
                </div>

                {/* الشركة */}
                <div>
                  <label style={labelStyle}><FiHome size={12} color="#7b192c" />{isAr ? 'اسم الشّركة - المؤسّسة' : 'Company / Business Name'}</label>
                  <input value={form.company} onChange={e => set('company', e.target.value)} style={inputStyle} placeholder={isAr ? 'اختياري' : 'Optional'}
                    onFocus={e => e.target.style.borderColor = '#7b192c'} onBlur={e => e.target.style.borderColor = '#E2C9A8'} />
                </div>

                {/* الدولة */}
                <div>
                  <label style={labelStyle}><FiMapPin size={12} color="#7b192c" />{t('wholesale.country')}</label>
                  <input value={form.country} onChange={e => set('country', e.target.value)} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#7b192c'} onBlur={e => e.target.style.borderColor = '#E2C9A8'} />
                </div>

                {/* الإيميل */}
                <div>
                  <label style={labelStyle}><FiMail size={12} color="#7b192c" />{t('wholesale.email')} *</label>
                  <input value={form.email} onChange={e => set('email', e.target.value)} type="email" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#7b192c'} onBlur={e => e.target.style.borderColor = '#E2C9A8'} />
                </div>

                {/* واتساب */}
                <div>
                  <label style={labelStyle}><FiPhone size={12} color="#7b192c" />{t('wholesale.whatsapp')} *</label>
                  <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} type="tel" placeholder="+xx xxx xxx xxxx" style={{ ...inputStyle, direction: 'ltr' }}
                    onFocus={e => e.target.style.borderColor = '#7b192c'} onBlur={e => e.target.style.borderColor = '#E2C9A8'} />
                </div>

                {/* نوع العمل */}
                <div>
                  <label style={labelStyle}><FiBriefcase size={12} color="#7b192c" />{t('wholesale.business')} *</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {BUSINESS_TYPES.map(bt => (
                      <button key={bt.value} onClick={() => set('business', bt.value)} style={{
                        padding: '7px 16px', borderRadius: 50, border: '2px solid',
                        borderColor: form.business === bt.value ? '#7b192c' : '#E2C9A8',
                        background: form.business === bt.value ? 'linear-gradient(to left, #7b192c, #a82040)' : '#FFFBF5',
                        color: form.business === bt.value ? '#f4be69' : '#6B3A2A',
                        fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                        fontFamily: 'Amiri, serif', transition: 'all 0.2s',
                      }}>
                        {isAr ? bt.label_ar : bt.label_en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* التفاصيل */}
                <div>
                  <label style={labelStyle}>{t('wholesale.details')}</label>
                  <textarea value={form.details} onChange={e => set('details', e.target.value)} rows={3}
                    placeholder={isAr ? 'الكمّيّة المطلوبة، المُنتجات المُفضّلة، أي ملاحظات...' : 'Required quantity, preferred products, any notes...'}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => e.target.style.borderColor = '#7b192c'} onBlur={e => e.target.style.borderColor = '#E2C9A8'}
                  />
                </div>

                {/* زر الإرسال */}
                <button onClick={handleSubmit} disabled={loading} style={{
                  background: loading ? '#E2C9A8' : 'linear-gradient(to left, #7b192c, #a82040)',
                  color: loading ? '#9C6B4E' : '#f4be69',
                  padding: '13px 0', borderRadius: 12,
                  fontWeight: 700, fontSize: '0.95rem', border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: 'Amiri, serif',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(123,25,44,0.25)',
                }}>
                  <FiSend size={15} />
                  {loading ? (isAr ? 'جاري الإرسال...' : 'Sending...') : t('wholesale.send')}
                </button>

                {/* واتساب */}
                <a href={waUrl} target="_blank" rel="noreferrer" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'rgba(37,211,102,0.08)', color: '#16A34A',
                  padding: '11px 0', borderRadius: 12,
                  fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none',
                  border: '2px solid rgba(37,211,102,0.2)', fontFamily: 'Amiri, serif',
                  transition: 'background 0.2s',
                }}>
                  <SiWhatsapp size={16} />
                  {isAr ? 'أو تواصل عبر واتساب' : 'Or contact via WhatsApp'}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}