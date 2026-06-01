import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const COMPANY = {
  name:    'Faour Group Turizm Hizmetleri Limited Şirketi',
  brand:   'Aromena Spices',
  address: 'Göztepe Mah. Batişehir Cad. 2/2 İç Kapı No:115, Bağcılar/İstanbul, Türkiye',
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
    title: 'عقد البيع عن بُعد',
    updated: 'آخر تحديث: أبريل 2026',
    sections: [
      { title: '1. أطراف العقد', text: `البائع: ${COMPANY.brand} — ${COMPANY.name}\nالعنوان: ${COMPANY.address}\nالسجل التجاري: ${COMPANY.reg}\nالهاتف: ${COMPANY.phone}\nالبريد: ${COMPANY.email}\n\nالمشتري: العميل الذي أتم عملية الشراء عبر ${COMPANY.web}` },
      { title: '2. موضوع العقد', text: 'يتعلق هذا العقد بشراء المنتجات الغذائية (البهارات والتوابل) المعروضة على الموقع الإلكتروني لـ Aromena Spices وتسليمها للمشتري وفق الشروط المذكورة.' },
      { title: '3. سعر المنتج والدفع', text: 'الأسعار المعروضة شاملة للضرائب المطبقة. يتم الدفع عبر بوابة الدفع الآمنة iyzico. لن يتم شحن الطلب إلا بعد تأكيد الدفع الكامل.' },
      { title: '4. التسليم', text: 'يتم التسليم إلى العنوان المحدد عند الطلب. المدة المتوقعة: 5-10 أيام عمل. يتحمل البائع مسؤولية المنتج حتى وصوله سليماً للعميل.' },
      { title: '5. حق العدول', text: 'وفقاً للأنظمة المعمول بها، يحق للمشتري العدول عن الشراء خلال 14 يوماً من تاريخ الاستلام دون إبداء أي سبب، شريطة أن يكون المنتج في حالته الأصلية وغير مفتوح.' },
      { title: '6. استثناءات حق العدول', text: 'لا يسري حق العدول على المنتجات الغذائية التي تم فتحها بعد التسليم، نظراً لطبيعتها كمواد غذائية سريعة التلف.' },
      { title: '7. إخلاء مسؤولية الحساسية — تنبيه مهم', text: 'منتجاتنا بهارات طبيعية قد تحتوي على مسببات حساسية (كرفس، خردل، سمسم، مكسرات وغيرها). يتحمل المستهلك المسؤولية الكاملة عن قراءة قائمة المكونات قبل الاستخدام. لا تتحمل Aromena Spices ولا Faour Group أي مسؤولية قانونية أو مالية عن تفاعلات حساسية ناتجة عن عدم قراءة المكونات أو الاستخدام الخاطئ. من يعاني من حساسية غذائية يجب عليه التواصل معنا قبل الشراء.' },
      { title: '8. حل النزاعات', text: 'في حال أي نزاع، يُتواصل أولاً معنا عبر Ghaliasawan@gmail.com لإيجاد حل ودي. في حال تعذّر ذلك، تُحكم المحاكم التركية المختصة في إسطنبول.' },
      { title: '9. القبول', text: 'بإتمام عملية الشراء، يُعتبر المشتري قد قرأ هذا العقد وفهمه ووافق على جميع شروطه وأحكامه.' },
    ],
  },
  tr: {
    title: 'Mesafeli Satış Sözleşmesi',
    updated: 'Son güncelleme: Nisan 2026',
    sections: [
      { title: '1. Taraflar', text: `Satıcı: ${COMPANY.brand} — ${COMPANY.name}\nAdres: ${COMPANY.address}\nTicaret Sicil No: ${COMPANY.reg}\nTelefon: ${COMPANY.phone}\nE-posta: ${COMPANY.email}\n\nAlıcı: ${COMPANY.web} üzerinden satın alma işlemini tamamlayan müşteri` },
      { title: '2. Sözleşmenin Konusu', text: 'Bu sözleşme, Aromena Spices web sitesinde sunulan gıda ürünlerinin (baharat ve çeşniler) satın alınması ve belirtilen şartlar dahilinde alıcıya teslim edilmesine ilişkindir.' },
      { title: '3. Ürün Fiyatı ve Ödeme', text: 'Sitede gösterilen fiyatlar geçerli vergiler dahildir. Ödeme, güvenli iyzico altyapısı üzerinden yapılır. Sipariş, ödeme tamamen onaylandıktan sonra kargoya verilir.' },
      { title: '4. Teslimat', text: 'Ürünler sipariş sırasında belirtilen adrese teslim edilir. Beklenen süre: 5-10 iş günü. Satıcı, ürünün alıcıya sağlam ulaşmasından sorumludur.' },
      { title: '5. Cayma Hakkı', text: 'Yürürlükteki mevzuat uyarınca alıcı, teslim tarihinden itibaren 14 gün içinde herhangi bir gerekçe göstermeksizin sözleşmeden cayabilir. Ürünün açılmamış ve orijinal ambalajında olması şarttır.' },
      { title: '6. Cayma Hakkının İstisnaları', text: 'Teslimattan sonra açılmış gıda ürünleri, bozulabilir nitelikte olduklarından 6502 sayılı Tüketicinin Korunması Hakkında Kanun\'un 15. maddesi uyarınca cayma hakkı kapsamı dışındadır.' },
      { title: '7. Alerji Sorumluluk Reddi — Önemli Uyarı', text: 'Ürünlerimiz; kereviz, hardal, susam, fındık ve diğer alerjenler içerebilecek doğal baharatlardır. Tüketici, kullanmadan önce içerik listesini okumaktan tamamen sorumludur. Aromena Spices ve Faour Group, içeriklerin okunmaması veya yanlış kullanımdan kaynaklanan alerjik reaksiyonlardan hukuki veya mali olarak sorumlu tutulamaz. Gıda alerjisi olanlar satın almadan önce bizimle iletişime geçmelidir.' },
      { title: '8. Uyuşmazlık Çözümü', text: 'Anlaşmazlık durumunda önce Ghaliasawan@gmail.com üzerinden dostane çözüm aranır. Çözülemezse İstanbul mahkemeleri yetkilidir.' },
      { title: '9. Kabul', text: 'Satın alma işlemini tamamlayarak alıcı, bu sözleşmeyi okuduğunu, anladığını ve tüm hüküm ve koşulları kabul ettiğini beyan eder.' },
    ],
  },
  de: {
    title: 'Fernabsatzvertrag',
    updated: 'Letzte Aktualisierung: April 2026',
    sections: [
      { title: '1. Vertragsparteien', text: `Verkäufer: ${COMPANY.brand} — ${COMPANY.name}\nAdresse: ${COMPANY.address}\nHandelsregisternummer: ${COMPANY.reg}\nTelefon: ${COMPANY.phone}\nE-Mail: ${COMPANY.email}\n\nKäufer: Der Kunde, der den Kauf über ${COMPANY.web} abgeschlossen hat` },
      { title: '2. Vertragsgegenstand', text: 'Dieser Vertrag betrifft den Kauf von Lebensmitteln (Gewürze und Kräuter), die auf der Aromena Spices-Website angeboten werden, und deren Lieferung an den Käufer gemäß den genannten Bedingungen.' },
      { title: '3. Produktpreis und Zahlung', text: 'Die auf der Website angezeigten Preise sind inklusive geltender Steuern. Die Zahlung erfolgt über die sichere iyzico-Infrastruktur. Die Bestellung wird erst nach vollständiger Zahlungsbestätigung versandt.' },
      { title: '4. Lieferung', text: 'Produkte werden an die bei der Bestellung angegebene Adresse geliefert. Erwartete Lieferzeit: 5-10 Werktage. Der Verkäufer haftet für die unbeschädigte Lieferung an den Käufer.' },
      { title: '5. Widerrufsrecht', text: 'Gemäß geltendem Recht hat der Käufer das Recht, innerhalb von 14 Tagen nach Erhalt ohne Angabe von Gründen vom Vertrag zurückzutreten. Das Produkt muss ungeöffnet und in Originalverpackung sein.' },
      { title: '6. Ausnahmen vom Widerrufsrecht', text: 'Nach der Lieferung geöffnete Lebensmittelprodukte sind aufgrund ihrer verderblichen Natur vom Widerrufsrecht ausgeschlossen (§ 312g Abs. 2 Nr. 2 BGB).' },
      { title: '7. Allergie-Haftungsausschluss — Wichtiger Hinweis', text: 'Unsere Produkte sind natürliche Gewürze, die Allergene wie Sellerie, Senf, Sesam, Nüsse und andere enthalten können. Der Verbraucher trägt die volle Verantwortung für das Lesen der Zutatenliste vor der Verwendung. Aromena Spices und Faour Group übernehmen keine rechtliche oder finanzielle Haftung für allergische Reaktionen, die durch Nichtlesen der Inhaltsstoffe oder unsachgemäße Verwendung entstehen. Personen mit Lebensmittelallergien sollten uns vor dem Kauf kontaktieren.' },
      { title: '8. Streitbeilegung', text: 'Bei Streitigkeiten wird zunächst eine gütliche Einigung über Ghaliasawan@gmail.com angestrebt. Sollte dies scheitern, sind die zuständigen Gerichte in Istanbul zuständig.' },
      { title: '9. Annahme', text: 'Durch den Abschluss des Kaufs erklärt der Käufer, diesen Vertrag gelesen und verstanden zu haben und allen Bedingungen zuzustimmen.' },
    ],
  },
  en: {
    title: 'Distance Sales Contract',
    updated: 'Last updated: April 2026',
    sections: [
      { title: '1. Parties', text: `Seller: ${COMPANY.brand} — ${COMPANY.name}\nAddress: ${COMPANY.address}\nTrade Register No: ${COMPANY.reg}\nPhone: ${COMPANY.phone}\nEmail: ${COMPANY.email}\n\nBuyer: The customer who completed the purchase via ${COMPANY.web}` },
      { title: '2. Subject of Contract', text: 'This contract concerns the purchase of food products (spices and seasonings) offered on the Aromena Spices website and their delivery to the buyer under the stated terms.' },
      { title: '3. Product Price and Payment', text: 'Prices displayed on the website include applicable taxes. Payment is processed through the secure iyzico platform. The order will not be shipped until full payment is confirmed.' },
      { title: '4. Delivery', text: 'Products are delivered to the address specified at the time of order. Expected delivery time: 5-10 business days. The seller is responsible for the undamaged delivery to the buyer.' },
      { title: '5. Right of Withdrawal', text: 'Under applicable law, the buyer has the right to withdraw from the purchase within 14 days of receipt without giving any reason. The product must be unopened and in its original packaging.' },
      { title: '6. Exceptions to Right of Withdrawal', text: 'Food products that have been opened after delivery are excluded from the right of withdrawal due to their perishable nature.' },
      { title: '7. Allergy Disclaimer — Important Notice', text: 'Our products are natural spices that may contain allergens such as celery, mustard, sesame, nuts, and others. The consumer bears full responsibility for reading the ingredient list before use. Aromena Spices and Faour Group accept no legal or financial liability for allergic reactions resulting from failure to read product ingredients or improper use. Persons with food allergies should contact us before purchasing.' },
      { title: '8. Dispute Resolution', text: 'In case of any dispute, an amicable resolution will first be sought via Ghaliasawan@gmail.com. If unsuccessful, the competent courts in Istanbul shall have jurisdiction.' },
      { title: '9. Acceptance', text: 'By completing the purchase, the buyer declares that they have read, understood, and agreed to all terms and conditions of this contract.' },
    ],
  },
}

export default function SalesContract() {
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