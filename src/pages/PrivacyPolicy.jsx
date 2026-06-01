import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const COMPANY = {
  name:    'Faour Group Turizm Hizmetleri Limited Şirketi',
  brand:   'Aromena Spices',
  address: 'Göztepe Mah. Batişehir Cad. 2/2 İç Kapı No:115, Bağcılar/İstanbul, Türkiye',
  zip:     '39470',
  reg:     '39470',
  phone:   '+90 555 075 4476',
  email:   'Ghaliasawan@gmail.com',
  web:     'aromina.com.tr',
  owner:   'Ghalia Sawan',
}

const LANGS = [
  { code: 'ar', label: 'العربية' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
]

const content = {
  ar: {
    title: 'سياسة الخصوصية',
    updated: 'آخر تحديث: أبريل 2026',
    sections: [
      {
        title: '1. معلومات الشركة',
        text: `الاسم التجاري: ${COMPANY.brand}\nالاسم القانوني: ${COMPANY.name}\nالعنوان: ${COMPANY.address}\nرقم السجل التجاري: ${COMPANY.reg}\nالهاتف: ${COMPANY.phone}\nالبريد الإلكتروني: ${COMPANY.email}\nالموقع: ${COMPANY.web}\nالمسؤول القانوني: ${COMPANY.owner}`,
      },
      {
        title: '2. المعلومات التي نجمعها',
        text: 'عند إنشاء حساب أو تقديم طلب، نجمع: الاسم الكامل، البريد الإلكتروني، رقم الهاتف، عنوان الشحن، ومعلومات الدفع (عبر بوابة iyzico الآمنة). كما نجمع بيانات الاستخدام مثل عناوين IP وملفات تعريف الارتباط.',
      },
      {
        title: '3. استخدام المعلومات',
        text: 'نستخدم معلوماتك لمعالجة الطلبات والتواصل معك بشأنها، وتحسين خدماتنا، وإرسال العروض والتحديثات (بموافقتك). لن نبيع أو نشارك معلوماتك مع أطراف ثالثة دون موافقتك الصريحة.',
      },
      {
        title: '4. الكوكيز وتتبع الاستخدام',
        text: 'يستخدم موقعنا ملفات تعريف الارتباط لتحسين تجربتك وتحليل حركة الزيارات. يمكنك تعطيل الكوكيز من إعدادات متصفحك، علماً أن ذلك قد يؤثر على بعض وظائف الموقع.',
      },
      {
        title: '5. حماية البيانات',
        text: 'نطبق إجراءات أمنية تقنية وتنظيمية لحماية بياناتك. جميع المعاملات المالية تتم عبر بوابة iyzico المشفرة. لا يتم تخزين بيانات بطاقات الائتمان على خوادمنا.',
      },
      {
        title: '6. تنبيه الحساسية الغذائية — إخلاء مسؤولية مهم',
        text: 'منتجاتنا عبارة عن بهارات وتوابل طبيعية قد تحتوي على مسببات الحساسية مثل: الكرفس، الخردل، السمسم، وغيرها. يتحمل المستهلك المسؤولية الكاملة عن قراءة قائمة المكونات قبل الاستخدام. لا تتحمل Aromena Spices أي مسؤولية عن تفاعلات حساسية تنشأ عن عدم قراءة مكونات المنتج أو الاستخدام غير الصحيح. إذا كنت تعاني من أي حساسية غذائية، يُرجى التواصل معنا قبل الشراء.',
      },
      {
        title: '7. حقوقك',
        text: 'يحق لك في أي وقت: الاطلاع على بياناتك الشخصية، تصحيحها، حذفها، أو طلب نقلها. للتواصل: Ghaliasawan@gmail.com',
      },
      {
        title: '8. التواصل',
        text: `لأي استفسار بخصوص سياسة الخصوصية:\nالبريد الإلكتروني: ${COMPANY.email}\nالهاتف: ${COMPANY.phone}`,
      },
    ],
  },
  tr: {
    title: 'Gizlilik Politikası',
    updated: 'Son güncelleme: Nisan 2026',
    sections: [
      {
        title: '1. Şirket Bilgileri',
        text: `Ticari Adı: ${COMPANY.brand}\nHukuki Adı: ${COMPANY.name}\nAdres: ${COMPANY.address}\nTicaret Sicil No: ${COMPANY.reg}\nTelefon: ${COMPANY.phone}\nE-posta: ${COMPANY.email}\nWeb: ${COMPANY.web}\nYetkili: ${COMPANY.owner}`,
      },
      {
        title: '2. Topladığımız Bilgiler',
        text: 'Hesap oluştururken veya sipariş verirken şu bilgileri toplarız: ad soyad, e-posta, telefon, teslimat adresi ve ödeme bilgileri (güvenli iyzico altyapısı üzerinden). Ayrıca IP adresleri ve çerezler gibi kullanım verileri de toplanır.',
      },
      {
        title: '3. Bilgilerin Kullanımı',
        text: 'Bilgilerinizi siparişleri işlemek, sizinle iletişim kurmak, hizmetlerimizi geliştirmek ve (onayınızla) kampanya bildirimleri göndermek için kullanırız. Açık rızanız olmadan bilgilerinizi üçüncü taraflarla paylaşmayız.',
      },
      {
        title: '4. Çerezler ve Kullanım Takibi',
        text: 'Sitemiz deneyiminizi iyileştirmek ve trafik analizi yapmak için çerezler kullanır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu bazı site işlevlerini etkileyebilir.',
      },
      {
        title: '5. Veri Güvenliği',
        text: 'Verilerinizi korumak için teknik ve organizasyonel güvenlik önlemleri uyguluyoruz. Tüm finansal işlemler şifreli iyzico altyapısı üzerinden yapılır. Kredi kartı bilgileri sunucularımızda saklanmaz.',
      },
      {
        title: '6. Gıda Alerjisi Uyarısı — Önemli Sorumluluk Reddi',
        text: 'Ürünlerimiz; kereviz, hardal, susam ve diğer alerjen maddeleri içerebilecek doğal baharat ve çeşnilerdir. Tüketici, kullanmadan önce içerik listesini okumaktan tamamen sorumludur. Aromena Spices, ürün içeriğinin okunmaması veya yanlış kullanımdan kaynaklanan alerjik reaksiyonlardan sorumlu tutulamaz. Gıda alerjiniz varsa satın almadan önce bizimle iletişime geçin.',
      },
      {
        title: '7. Haklarınız',
        text: 'Kişisel verilerinize erişme, düzeltme, silme veya taşınabilirlik hakkına sahipsiniz. İletişim: Ghaliasawan@gmail.com',
      },
      {
        title: '8. İletişim',
        text: `Gizlilik politikamız hakkında sorularınız için:\nE-posta: ${COMPANY.email}\nTelefon: ${COMPANY.phone}`,
      },
    ],
  },
  de: {
    title: 'Datenschutzerklärung',
    updated: 'Letzte Aktualisierung: April 2026',
    sections: [
      {
        title: '1. Unternehmensangaben',
        text: `Markenname: ${COMPANY.brand}\nRechtlicher Name: ${COMPANY.name}\nAdresse: ${COMPANY.address}\nHandelsregisternummer: ${COMPANY.reg}\nTelefon: ${COMPANY.phone}\nE-Mail: ${COMPANY.email}\nWebsite: ${COMPANY.web}\nVerantwortliche Person: ${COMPANY.owner}`,
      },
      {
        title: '2. Erhobene Daten',
        text: 'Bei der Kontoerstellung oder Bestellung erheben wir: vollständigen Namen, E-Mail-Adresse, Telefonnummer, Lieferadresse und Zahlungsdaten (über die sichere iyzico-Plattform). Zusätzlich werden Nutzungsdaten wie IP-Adressen und Cookies erfasst.',
      },
      {
        title: '3. Verwendung der Daten',
        text: 'Ihre Daten werden zur Bestellabwicklung, Kommunikation, Serviceverbesserung und (mit Ihrer Einwilligung) für Angebots-Benachrichtigungen verwendet. Ohne Ihre ausdrückliche Zustimmung werden Ihre Daten nicht an Dritte weitergegeben.',
      },
      {
        title: '4. Cookies und Nutzungsverfolgung',
        text: 'Unsere Website verwendet Cookies zur Verbesserung Ihrer Erfahrung und zur Traffic-Analyse. Sie können Cookies in Ihren Browser-Einstellungen deaktivieren, was jedoch einige Website-Funktionen beeinträchtigen kann.',
      },
      {
        title: '5. Datensicherheit',
        text: 'Wir wenden technische und organisatorische Sicherheitsmaßnahmen zum Schutz Ihrer Daten an. Alle Finanztransaktionen erfolgen über die verschlüsselte iyzico-Infrastruktur. Kreditkartendaten werden nicht auf unseren Servern gespeichert.',
      },
      {
        title: '6. Lebensmittelallergie-Warnung — Wichtiger Haftungsausschluss',
        text: 'Unsere Produkte sind natürliche Gewürze und Kräuter, die Allergene wie Sellerie, Senf, Sesam und andere enthalten können. Der Verbraucher trägt die volle Verantwortung für das Lesen der Zutatenliste vor der Verwendung. Aromena Spices übernimmt keine Haftung für allergische Reaktionen, die durch Nichtlesen der Produktzutaten oder unsachgemäße Verwendung entstehen. Bei Lebensmittelallergien wenden Sie sich bitte vor dem Kauf an uns.',
      },
      {
        title: '7. Ihre Rechte',
        text: 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung oder Übertragbarkeit Ihrer personenbezogenen Daten. Kontakt: Ghaliasawan@gmail.com',
      },
      {
        title: '8. Kontakt',
        text: `Bei Fragen zu unserer Datenschutzerklärung:\nE-Mail: ${COMPANY.email}\nTelefon: ${COMPANY.phone}`,
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: April 2026',
    sections: [
      {
        title: '1. Company Information',
        text: `Brand Name: ${COMPANY.brand}\nLegal Name: ${COMPANY.name}\nAddress: ${COMPANY.address}\nTrade Register No: ${COMPANY.reg}\nPhone: ${COMPANY.phone}\nEmail: ${COMPANY.email}\nWebsite: ${COMPANY.web}\nResponsible Person: ${COMPANY.owner}`,
      },
      {
        title: '2. Information We Collect',
        text: 'When creating an account or placing an order, we collect: full name, email address, phone number, shipping address, and payment details (via secure iyzico platform). We also collect usage data such as IP addresses and cookies.',
      },
      {
        title: '3. Use of Information',
        text: 'We use your information to process orders, communicate with you, improve our services, and (with your consent) send promotional notifications. We will not sell or share your information with third parties without your explicit consent.',
      },
      {
        title: '4. Cookies and Usage Tracking',
        text: 'Our website uses cookies to improve your experience and analyze traffic. You can disable cookies in your browser settings, though this may affect some website functions.',
      },
      {
        title: '5. Data Security',
        text: 'We apply technical and organizational security measures to protect your data. All financial transactions are processed through the encrypted iyzico infrastructure. Credit card data is not stored on our servers.',
      },
      {
        title: '6. Food Allergy Warning — Important Disclaimer',
        text: 'Our products are natural spices and seasonings that may contain allergens such as celery, mustard, sesame, and others. The consumer bears full responsibility for reading the ingredient list before use. Aromena Spices accepts no liability for allergic reactions resulting from failure to read product ingredients or improper use. If you have food allergies, please contact us before purchasing.',
      },
      {
        title: '7. Your Rights',
        text: 'You have the right to access, correct, delete, or transfer your personal data at any time. Contact: Ghaliasawan@gmail.com',
      },
      {
        title: '8. Contact',
        text: `For any questions about our privacy policy:\nEmail: ${COMPANY.email}\nPhone: ${COMPANY.phone}`,
      },
    ],
  },
}

export default function PrivacyPolicy() {
  const { i18n } = useTranslation()
  const [lang, setLang] = useState(i18n.language === 'ar' ? 'ar' : 'en')
  const c = content[lang]

  return (
    <div style={{ background: '#F5E6D3', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #7b192c, #a82040)', padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: '#f4be69', fontFamily: 'Amiri, serif', marginBottom: 20 }}>
          {c.title}
        </h1>
        {/* مبدّل اللغة */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)} style={{
              padding: '6px 16px', borderRadius: 50,
              border: '1.5px solid rgba(244,190,105,0.4)',
              background: lang === l.code ? '#f4be69' : 'transparent',
              color: lang === l.code ? '#7b192c' : '#f4be69',
              fontWeight: lang === l.code ? 700 : 400,
              fontSize: '0.82rem', cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', border: '1px solid #E2C9A8', boxShadow: '0 2px 14px rgba(123,25,44,0.05)' }}>
          <p style={{ color: '#9C6B4E', fontSize: '0.82rem', marginBottom: 28 }}>{c.updated}</p>
          {c.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Amiri, serif', fontSize: '1.1rem', marginBottom: 10, color: '#7b192c' }}>{s.title}</h2>
              <p style={{ color: '#3E1C00', lineHeight: 1.9, fontSize: '0.92rem', whiteSpace: 'pre-line',
                ...(i === 5 ? { background: '#FEF3C7', borderRadius: 10, padding: '12px 16px', border: '1px solid #FDE68A', color: '#92400E' } : {})
              }}>
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}