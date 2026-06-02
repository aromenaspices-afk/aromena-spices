import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const COMPANY = {
  name:  'Faour Group Turizm Hizmetleri Limited Şirketi',
  brand: 'Aromena Spices',
  email: 'Ghaliasawan@gmail.com',
  phone: '+90 555 075 4476',
}

const LANGS = [
  { code: 'ar', label: 'العربية' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
]

const content = {
  ar: {
    title: 'شروط التسليم والإرجاع',
    updated: 'آخر تحديث: أبريل 2026',
    sections: [
      { title: '1. مناطق الشّحن', text: 'نشحن إلى أوروبّا (ألمانيا، هولندا، بلجيكا، النمسا وغيرها)، دول الخليج العربي، تركيّا، والأردن.' },
      { title: '2. مدة التسليم', text: 'تتراوح مدة التسليم بين 5 و10 أيام عمل حسب بلد الوجهة. بعد تأكيد طلبك ستتلقى رقم التتبع على بريدك الإلكتروني.' },
      { title: '3. تكلفة الشّحن', text: 'تكلفة الشّحن تظهر عند إتمام الطّلب بناءً على وجهة التسليم. الشّحن مجاني على الطّلبات التي تتجاوز قيمتها الحد المحدد لكل منطقة.' },
      { title: '4. سياسة الإرجاع', text: 'يمكنك إرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام، شريطة أن تكون في حالتها الأصلية وغير مفتوحة. تكلفة الشّحن العكسي تقع على عاتق العميل ما لم يكن المنتج تالفاً أو مغلوطاً.' },
      { title: '5. المنتجات الغذائية المفتوحة', text: 'لأسباب صحية وسلامة غذائية، لا يمكن قبول إرجاع المنتجات الغذائية التي تمَّ فتحها بعد الاستلام.' },
      { title: '6. المنتجات التالفة أو الخاطئة', text: 'إذا وصلك المنتج تالفاً أو مغايراً لما طلبته، تواصل معنا خلال 48 ساعة من الاستلام مع صور المنتج، وسنعوضك كاملاً أو نرسل بديلاً على حسابنا.' },
      { title: '7. إخلاء مسؤولية الحساسية', text: 'منتجاتنا بهارات طبيعية قد تحتوي على مسببات حساسية. يتحمل المستهلك مسؤولية قراءة المكوّنات قبل الاستخدام. Aromena Spices غير مسؤولة عن أي تفاعلات حساسية ناتجة عن عدم قراءة المكوّنات.' },
      { title: '8. التواصل', text: `للاستفسارات والشكاوى:\nالبريد الإلكتروني: ${COMPANY.email}\nواتساب: ${COMPANY.phone}` },
    ],
  },
  tr: {
    title: 'Teslimat ve İade Şartları',
    updated: 'Son güncelleme: Nisan 2026',
    sections: [
      { title: '1. Teslimat Bölgeleri', text: 'Avrupa (Almanya, Hollanda, Belçika, Avusturya vb.), Körfez ülkeleri, Türkiye ve Ürdün\'e kargo gönderiyoruz.' },
      { title: '2. Teslimat Süresi', text: 'Teslimat süresi, hedef ülkeye bağlı olarak 5-10 iş günü arasında değişir. Sipariş onaylandıktan sonra takip numarası e-posta ile gönderilir.' },
      { title: '3. Kargo Ücreti', text: 'Kargo ücreti, teslimat adresine göre sipariş tamamlanırken gösterilir. Her bölge için belirlenen tutarın üzerindeki siparişlerde kargo ücretsizdir.' },
      { title: '4. İade Politikası', text: 'Teslim tarihinden itibaren 14 gün içinde, orijinal ambalajında ve açılmamış ürünleri iade edebilirsiniz. Ürün hasarlı veya yanlış değilse iade kargo ücreti alıcıya aittir.' },
      { title: '5. Açılmış Gıda Ürünleri', text: 'Gıda güvenliği nedeniyle teslimattan sonra açılmış gıda ürünleri iade kabul edilmez.' },
      { title: '6. Hasarlı veya Yanlış Ürünler', text: 'Ürün hasarlı veya sipariş ettiğinizden farklı gelirse, teslimattan itibaren 48 saat içinde ürün fotoğraflarıyla bizimle iletişime geçin. Tam iade veya ücretsiz yedek ürün göndereceğiz.' },
      { title: '7. Alerji Sorumluluk Reddi', text: 'Ürünlerimiz alerjen içerebilecek doğal baharatlardır. Tüketici kullanmadan önce içerik listesini okumaktan sorumludur. Aromena Spices, içeriklerin okunmamasından kaynaklanan alerjik reaksiyonlardan sorumlu tutulamaz.' },
      { title: '8. İletişim', text: `Sorular ve şikayetler için:\nE-posta: ${COMPANY.email}\nWhatsApp: ${COMPANY.phone}` },
    ],
  },
  de: {
    title: 'Liefer- und Rückgabebedingungen',
    updated: 'Letzte Aktualisierung: April 2026',
    sections: [
      { title: '1. Liefergebiete', text: 'Wir liefern nach Europa (Deutschland, Niederlande, Belgien, Österreich usw.), Golfstaaten, Türkei und Jordanien.' },
      { title: '2. Lieferzeit', text: 'Die Lieferzeit beträgt je nach Zielland 5-10 Werktage. Nach Auftragsbestätigung erhalten Sie eine Sendungsverfolgungsnummer per E-Mail.' },
      { title: '3. Versandkosten', text: 'Die Versandkosten werden beim Abschluss der Bestellung basierend auf der Lieferadresse angezeigt. Ab einem bestimmten Bestellwert ist der Versand kostenlos.' },
      { title: '4. Rückgaberichtlinie', text: 'Sie können ungeöffnete Produkte in Originalverpackung innerhalb von 14 Tagen nach Erhalt zurückgeben. Die Rücksendekosten trägt der Käufer, es sei denn, das Produkt ist beschädigt oder falsch.' },
      { title: '5. Geöffnete Lebensmittelprodukte', text: 'Aus hygienischen und lebensmittelsicherheitstechnischen Gründen können geöffnete Lebensmittelprodukte nach dem Erhalt nicht zurückgegeben werden.' },
      { title: '6. Beschädigte oder falsche Produkte', text: 'Falls das Produkt beschädigt oder falsch geliefert wurde, kontaktieren Sie uns innerhalb von 48 Stunden mit Fotos. Wir erstatten den vollen Betrag oder senden kostenlos Ersatz.' },
      { title: '7. Allergie-Haftungsausschluss', text: 'Unsere Produkte sind natürliche Gewürze, die Allergene enthalten können. Der Verbraucher trägt die Verantwortung für das Lesen der Zutatenliste. Aromena Spices haftet nicht für allergische Reaktionen durch Nichtlesen der Inhaltsstoffe.' },
      { title: '8. Kontakt', text: `Bei Fragen und Beschwerden:\nE-Mail: ${COMPANY.email}\nWhatsApp: ${COMPANY.phone}` },
    ],
  },
  en: {
    title: 'Shipping & Return Policy',
    updated: 'Last updated: April 2026',
    sections: [
      { title: '1. Shipping Regions', text: 'We ship to Europe (Germany, Netherlands, Belgium, Austria, etc.), Gulf countries, Turkey, and Jordan.' },
      { title: '2. Delivery Time', text: 'Delivery takes 5-10 business days depending on the destination country. After order confirmation, you will receive a tracking number by email.' },
      { title: '3. Shipping Cost', text: 'Shipping costs are shown at checkout based on the delivery address. Orders above a certain value qualify for free shipping.' },
      { title: '4. Return Policy', text: 'You may return unopened products in original packaging within 14 days of receipt. Return shipping costs are borne by the buyer unless the product is damaged or incorrect.' },
      { title: '5. Opened Food Products', text: 'For hygiene and food safety reasons, opened food products cannot be returned after delivery.' },
      { title: '6. Damaged or Incorrect Products', text: 'If the product arrives damaged or different from what you ordered, contact us within 48 hours with photos. We will provide a full refund or send a replacement at no cost.' },
      { title: '7. Allergy Disclaimer', text: 'Our products are natural spices that may contain allergens. The consumer is responsible for reading the ingredient list before use. Aromena Spices accepts no liability for allergic reactions resulting from failure to read product ingredients.' },
      { title: '8. Contact', text: `For inquiries and complaints:\nEmail: ${COMPANY.email}\nWhatsApp: ${COMPANY.phone}` },
    ],
  },
}

export default function ShippingPolicy() {
  const { i18n } = useTranslation()
  const [lang, setLang] = useState(i18n.language === 'ar' ? 'ar' : 'en')
  const c = content[lang]

  return (
    <div style={{ background: '#F5E6D3', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #7b192c, #a82040)', padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: '#f4be69', fontFamily: 'Amiri, serif', marginBottom: 20 }}>
          {c.title}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)} style={{
              padding: '6px 16px', borderRadius: 50,
              border: '1.5px solid rgba(244,190,105,0.4)',
              background: lang === l.code ? '#f4be69' : 'transparent',
              color: lang === l.code ? '#7b192c' : '#f4be69',
              fontWeight: lang === l.code ? 700 : 400,
              fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s',
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
                ...(i === 6 ? { background: '#FEF3C7', borderRadius: 10, padding: '12px 16px', border: '1px solid #FDE68A', color: '#92400E' } : {})
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