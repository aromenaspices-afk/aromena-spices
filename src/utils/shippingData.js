// ═══════════════════════════════════════════════════════
// نظام الشحن الديناميكي — يقرأ من Firestore
// ═══════════════════════════════════════════════════════
import { db } from '../firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

// ── افتراضي: Yurtiçi Kargo داخل تركيا ────────────────
export const DEFAULT_TURKEY = [
  { maxGrams: 500,   price: 36.90 },
  { maxGrams: 1000,  price: 64.30 },
  { maxGrams: 2000,  price: 82.00 },
  { maxGrams: 3000,  price: 84.10 },
  { maxGrams: 4000,  price: 100.95 },
  { maxGrams: 5000,  price: 124.60 },
  { maxGrams: 6999,  price: 219.00 },
  { maxGrams: 10000, price: 219.00 },
  { maxGrams: 20000, price: 328.50 },
]

// ── افتراضي: المناطق الدولية YK International ─────────
export const DEFAULT_ZONES = {
  1: [
    {w:0.5,p:312},{w:1,p:386},{w:1.5,p:456},{w:2,p:513},{w:2.5,p:569},
    {w:3,p:626},{w:3.5,p:711},{w:4,p:767},{w:5,p:880},{w:6,p:993},
    {w:7,p:1106},{w:8,p:1219},{w:10,p:1445},{w:12,p:1695},{w:15,p:2034},
    {w:20,p:2599},{w:25,p:3235},{w:30,p:3800},
  ],
  2: [
    {w:0.5,p:522},{w:1,p:522},{w:1.5,p:607},{w:2,p:663},{w:2.5,p:720},
    {w:3,p:776},{w:3.5,p:889},{w:4,p:946},{w:5,p:1059},{w:6,p:1172},
    {w:7,p:1285},{w:8,p:1398},{w:10,p:1624},{w:12,p:1897},{w:15,p:2236},
    {w:20,p:2801},{w:25,p:3507},{w:30,p:4072},
  ],
  3: [
    {w:0.5,p:660},{w:1,p:721},{w:2,p:822},{w:3,p:1352},{w:4,p:1416},
    {w:5,p:1558},{w:7,p:1888},{w:10,p:2301},{w:15,p:2888},{w:20,p:3474},{w:30,p:5500},
  ],
  4: [
    {w:0.5,p:653},{w:1,p:715},{w:2,p:813},{w:3,p:1278},{w:5,p:1592},
    {w:7,p:1932},{w:10,p:2342},{w:15,p:2893},{w:20,p:3480},{w:30,p:5521},
  ],
  5: [
    {w:0.5,p:1160},{w:1,p:1215},{w:1.5,p:1269},{w:2,p:1325},{w:3,p:2013},
    {w:4,p:2100},{w:5,p:2229},{w:7,p:2615},{w:10,p:3128},{w:15,p:4025},
    {w:20,p:4794},{w:25,p:5902},{w:30,p:7436},
  ],
  6: [
    {w:0.5,p:1226},{w:1,p:1289},{w:2,p:1415},{w:3,p:2183},{w:5,p:2519},
    {w:7,p:2912},{w:10,p:3360},{w:15,p:4186},{w:20,p:5045},{w:30,p:7766},
  ],
  7: [
    {w:0.5,p:1491},{w:1,p:1693},{w:2,p:2097},{w:3,p:3545},{w:5,p:4220},
    {w:7,p:5044},{w:10,p:6001},{w:15,p:7536},{w:20,p:9143},{w:30,p:13774},
  ],
  8: [
    {w:0.5,p:1536},{w:1,p:1575},{w:2,p:1652},{w:3,p:2265},{w:5,p:2553},
    {w:7,p:2946},{w:10,p:3415},{w:15,p:4257},{w:20,p:5024},{w:30,p:7682},
  ],
}

export const DEFAULT_COUNTRIES = [
  { country_ar:'تركيا',           country_en:'Turkey',       flag:'🇹🇷', zone:0, days:'1-3', domestic:true, freeOver:500  },
  { country_ar:'ألمانيا',         country_en:'Germany',      flag:'🇩🇪', zone:1, days:'4-5', freeOver:3000 },
  { country_ar:'هولندا',          country_en:'Netherlands',  flag:'🇳🇱', zone:2, days:'4-5', freeOver:3500 },
  { country_ar:'فرنسا',           country_en:'France',       flag:'🇫🇷', zone:2, days:'4-5', freeOver:3500 },
  { country_ar:'بلجيكا',          country_en:'Belgium',      flag:'🇧🇪', zone:2, days:'5-7', freeOver:3500 },
  { country_ar:'النمسا',          country_en:'Austria',      flag:'🇦🇹', zone:2, days:'4-5', freeOver:3500 },
  { country_ar:'إسبانيا',         country_en:'Spain',        flag:'🇪🇸', zone:2, days:'5-7', freeOver:3500 },
  { country_ar:'إيطاليا',         country_en:'Italy',        flag:'🇮🇹', zone:2, days:'5-7', freeOver:3500 },
  { country_ar:'السويد',          country_en:'Sweden',       flag:'🇸🇪', zone:3, days:'5-7', freeOver:4000 },
  { country_ar:'سويسرا',          country_en:'Switzerland',  flag:'🇨🇭', zone:3, days:'4-5', freeOver:4000 },
  { country_ar:'المملكة المتحدة', country_en:'UK',           flag:'🇬🇧', zone:3, days:'4-6', freeOver:4000 },
  { country_ar:'السعودية',        country_en:'Saudi Arabia', flag:'🇸🇦', zone:5, days:'3-4', freeOver:5000 },
  { country_ar:'الإمارات',        country_en:'UAE',          flag:'🇦🇪', zone:5, days:'2-3', freeOver:5000 },
  { country_ar:'الكويت',          country_en:'Kuwait',       flag:'🇰🇼', zone:5, days:'2-3', freeOver:5000 },
  { country_ar:'قطر',             country_en:'Qatar',        flag:'🇶🇦', zone:5, days:'2-3', freeOver:5000 },
  { country_ar:'البحرين',         country_en:'Bahrain',      flag:'🇧🇭', zone:5, days:'2-3', freeOver:5000 },
]

// ── جلب البيانات من Firestore ─────────────────────────
let _cache = null
let _cacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 دقائق

export async function getShippingConfig() {
  if (_cache && Date.now() - _cacheTime < CACHE_TTL) return _cache

  try {
    const snap = await getDoc(doc(db, 'settings', 'shipping'))
    if (snap.exists()) {
      _cache = snap.data()
      _cacheTime = Date.now()
      return _cache
    }
  } catch {}

  // fallback للبيانات الافتراضية
  return {
    turkey: DEFAULT_TURKEY,
    zones: DEFAULT_ZONES,
    countries: DEFAULT_COUNTRIES,
  }
}

export function clearShippingCache() { _cache = null }

// ── دالة حساب الشحن ──────────────────────────────────
export async function calculateShipping(countryInput, totalWeightKg, totalPrice) {
  const config = await getShippingConfig()
  const countries = config.countries || DEFAULT_COUNTRIES
  const zones = config.zones || DEFAULT_ZONES
  const turkey = config.turkey || DEFAULT_TURKEY

  if (!countryInput) return { price: 0, days: '—', found: false }

  const input = countryInput.trim().toLowerCase()
  const country = countries.find(c =>
    c.country_ar === countryInput.trim() ||
    c.country_en?.toLowerCase() === input ||
    input.includes(c.country_ar) ||
    input.includes(c.country_en?.toLowerCase() || '')
  )

  if (!country) return calcZone(8, totalWeightKg, zones, '10-14', null)

  // شحن مجاني
  if (totalPrice >= (country.freeOver || 99999)) {
    return { price: 0, days: country.days, found: true, country, free: true }
  }

  // شحن محلي تركيا
  if (country.domestic) {
    const grams = totalWeightKg * 1000
    const tier = turkey.find(t => grams <= t.maxGrams) || turkey[turkey.length - 1]
    return { price: tier.price, days: country.days, found: true, country, carrier: 'Yurtiçi Kargo' }
  }

  return calcZone(country.zone, totalWeightKg, zones, country.days, country)
}

function calcZone(zone, weightKg, zones, days, country) {
  const table = zones[zone] || zones[8]
  const w = Math.max(0.5, weightKg)
  for (const row of table) {
    if (w <= row.w) return { price: row.p, days, found: true, country }
  }
  return { price: table[table.length - 1].p, days, found: true, country }
}

// ── تحليل ملف Excel ───────────────────────────────────
export async function parseShippingExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const { read, utils } = await import('xlsx')
        const wb = read(e.target.result, { type: 'array' })

        const result = { zones: { ...DEFAULT_ZONES }, turkey: [...DEFAULT_TURKEY ] }

        // ورقة standart %50
        const stdSheet = wb.Sheets['standart %50']
        if (stdSheet) {
          const rows = utils.sheet_to_json(stdSheet, { header: 1 })
          const newZones = {}
          rows.slice(2).forEach(row => {
            const weight = row[1]
            if (!weight || typeof weight !== 'number') return
            for (let z = 1; z <= 8; z++) {
              if (!newZones[z]) newZones[z] = []
              const priceEur = row[z + 1]
              if (priceEur) newZones[z].push({ w: weight, p: Math.round(priceEur * 35) })
            }
          })
          if (Object.keys(newZones).length > 0) result.zones = newZones
        }

        resolve(result)
      } catch (err) {
        reject(err)
      }
    }
    reader.readAsArrayBuffer(file)
  })
}