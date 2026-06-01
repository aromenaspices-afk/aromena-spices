import { db } from '../firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { products } from '../data/products'

const initialPackages = [
  {
    id: 'classic', emoji: '🌿',
    name_ar: 'باقة الكلاسيك', name_en: 'Classic Box',
    desc_ar: 'تشكيلة من أشهر البهارات الكلاسيكية',
    desc_en: 'A selection of the most popular classic spices',
    price: 24.99, color: '#059669',
    items: ['sumac', 'shawarma', 'shish', 'salad'],
    tag_ar: '', tag_en: '', image: null,
  },
  {
    id: 'spicy', emoji: '🔥',
    name_ar: 'باقة الحارة', name_en: 'Spicy Box',
    desc_ar: 'للعشاق البهارات الحارة والقوية',
    desc_en: 'For lovers of hot and bold spices',
    price: 27.99, color: '#DC2626',
    items: ['cajun', 'red-pepper', 'meat-spice', 'shawarma'],
    tag_ar: 'الأكثر طلباً', tag_en: 'Most Popular', image: null,
  },
  {
    id: 'premium', emoji: '⭐',
    name_ar: 'باقة البريميوم', name_en: 'Premium Box',
    desc_ar: 'أفخر البهارات من الدرجة الأولى',
    desc_en: 'The finest top-grade premium spices',
    price: 34.99, color: '#B45309',
    items: ['kabsa', 'mandi', 'ottoman', 'meat-spice'],
    tag_ar: 'الأفضل قيمة', tag_en: 'Best Value', image: null,
  },
]

const initialSettings = {
  site_name: 'Aromena Spices',
  site_name_ar: 'أرومينا للبهارات',
  tagline_ar: 'بهارات أصيلة من قلب الشرق',
  tagline_en: 'Authentic Spices from the Heart of the East',
  email: 'aromena.official@gmail.com',
  whatsapp: '+905550044476',
  phone: '+905550044476',
  instagram: 'aromena.official',
  tiktok: 'aromena.official',
  domain: 'aromina.com.tr',
  return_policy_days: 14,
  vat_enabled: false,
  chat_name: 'Adam',
  chat_welcome_ar: 'أهلاً! كيف أقدر أساعدك؟',
  chat_welcome_en: 'Hello! How can I help you?',
  hero_title_ar: 'بهارات أصيلة',
  hero_title_en: 'Authentic Spices',
  hero_subtitle_ar: 'سرّ النّكهة الّلي بتشبه بيتنا',
  hero_subtitle_en: 'From the Heart of the East to Your Kitchen',
  logo_url: null,
  owner_photo_url: null,
}

export async function seedFirestore() {
  console.log('🔥 بدء رفع البيانات...')

  // المنتجات — فقط إذا ما موجودة
  for (const product of products) {
    const existing = await getDoc(doc(db, 'products', product.slug))
    if (!existing.exists()) {
      await setDoc(doc(db, 'products', product.slug), {
        ...product,
        image: product.image || null,
      })
      console.log('✅ منتج جديد:', product.name_en)
    } else {
      console.log('⏭️ موجود، تخطي:', product.name_en)
    }
  }

  // الباقات — فقط إذا ما موجودة
  for (const pkg of initialPackages) {
    const existing = await getDoc(doc(db, 'packages', pkg.id))
    if (!existing.exists()) {
      await setDoc(doc(db, 'packages', pkg.id), pkg)
      console.log('✅ باقة جديدة:', pkg.name_en)
    } else {
      console.log('⏭️ موجودة، تخطي:', pkg.name_en)
    }
  }

  // الإعدادات — فقط إذا ما موجودة
  const existingSettings = await getDoc(doc(db, 'settings', 'main'))
  if (!existingSettings.exists()) {
    await setDoc(doc(db, 'settings', 'main'), initialSettings)
    console.log('✅ الإعدادات')
  } else {
    console.log('⏭️ الإعدادات موجودة، تخطي')
  }

  console.log('🎉 تم!')
  return true
}