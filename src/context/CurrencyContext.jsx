import { createContext, useContext, useState, useEffect } from 'react'

const CurrencyContext = createContext()

// العملات المدعومة (الرمز + الاسم + هل يُوضَع الرمز قبل الرقم)
export const CURRENCIES = {
  TRY: { symbol: '₺',  name: 'Türk Lirası',  flag: '🇹🇷', before: true  },
  USD: { symbol: '$',   name: 'US Dollar',     flag: '🇺🇸', before: true  },
  EUR: { symbol: '€',   name: 'Euro',          flag: '🇪🇺', before: true  },
  GBP: { symbol: '£',   name: 'British Pound', flag: '🇬🇧', before: true  },
  SAR: { symbol: 'ر.س', name: 'ريال سعودي',   flag: '🇸🇦', before: false },
  AED: { symbol: 'د.إ', name: 'درهم إماراتي', flag: '🇦🇪', before: false },
  KWD: { symbol: 'د.ك', name: 'دينار كويتي',  flag: '🇰🇼', before: false },
  QAR: { symbol: 'ر.ق', name: 'ريال قطري',    flag: '🇶🇦', before: false },
  BHD: { symbol: 'د.ب', name: 'دينار بحريني', flag: '🇧🇭', before: false },
  OMR: { symbol: 'ر.ع', name: 'ريال عُماني',   flag: '🇴🇲', before: false },
  JOD: { symbol: 'د.أ', name: 'دينار أردني',  flag: '🇯🇴', before: false },
  EGP: { symbol: 'ج.م', name: 'جنيه مصري',    flag: '🇪🇬', before: false },
}

// أسعار صرف احتياطيّة تقريبيّة (وحدات لكلّ 1 ليرة تركيّة) — تُستبدَل بالحيّة
const FALLBACK_RATES = {
  TRY: 1, USD: 0.029, EUR: 0.027, GBP: 0.023, SAR: 0.11, AED: 0.107,
  KWD: 0.0089, QAR: 0.106, BHD: 0.011, OMR: 0.011, JOD: 0.021, EGP: 1.45,
}

const EXCHANGE_API_KEY = import.meta.env.VITE_EXCHANGERATE_API_KEY || '9242ee4806c6d1d9c52ee0c1'
const RATES_CACHE = 'fx_rates_try_v1'
const PREF_KEY    = 'currency_pref'   // اختيار يدويّ ثابت
const AUTO_KEY    = 'currency_auto'   // آخر كشف تلقائيّ (لعرض سريع)

function readLS(k) { try { return localStorage.getItem(k) } catch { return null } }
function writeLS(k, v) { try { localStorage.setItem(k, v) } catch { /* */ } }

// كشف عملة الزائر من الـIP (مع احتياطيّ)
async function detectCurrency() {
  try {
    const r = await fetch('https://ipwho.is/?fields=success,currency')
    const d = await r.json()
    if (d?.success && d?.currency?.code) return d.currency.code
  } catch { /* */ }
  try {
    const r = await fetch('https://ipapi.co/currency/')
    const t = (await r.text()).trim().toUpperCase()
    if (/^[A-Z]{3}$/.test(t)) return t
  } catch { /* */ }
  return null
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() =>
    readLS(PREF_KEY) || readLS(AUTO_KEY) || 'TRY'
  )
  const [rates, setRates] = useState(FALLBACK_RATES)
  const [loading, setLoading] = useState(true)

  // جلب أسعار الصرف الحيّة (نسبةً لليرة) مع تخزين مؤقّت 12 ساعة
  useEffect(() => {
    let cancelled = false
    async function loadRates() {
      try {
        const cached = JSON.parse(readLS(RATES_CACHE) || 'null')
        if (cached?.rates && cached?.t && (Date.now() - cached.t) < 12 * 3600 * 1000) {
          if (!cancelled) setRates({ ...FALLBACK_RATES, ...cached.rates })
          return
        }
        const res = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/TRY`)
        const data = await res.json()
        if (data.result === 'success' && data.conversion_rates) {
          if (!cancelled) setRates({ ...FALLBACK_RATES, ...data.conversion_rates })
          writeLS(RATES_CACHE, JSON.stringify({ rates: data.conversion_rates, t: Date.now() }))
        }
      } catch { /* نُبقي الاحتياطيّة */ } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadRates()
    return () => { cancelled = true }
  }, [])

  // كشف تلقائيّ للعملة (إلّا إن اختار المستخدم يدويّاً سابقاً)
  useEffect(() => {
    if (readLS(PREF_KEY)) return // احترام الاختيار اليدويّ
    let cancelled = false
    detectCurrency().then(code => {
      if (cancelled || !code) return
      const supported = CURRENCIES[code] ? code : (code === 'TRY' ? 'TRY' : 'USD')
      writeLS(AUTO_KEY, supported)
      setCurrencyState(supported)
    })
    return () => { cancelled = true }
  }, [])

  // تحويل سعر بالليرة إلى العملة النشطة
  function convert(priceTRY) {
    const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 1
    return (Number(priceTRY) || 0) * rate
  }

  // تنسيق السعر بالعملة النشطة
  function formatPrice(priceTRY) {
    const info = CURRENCIES[currency] || CURRENCIES.USD
    const decimals = ['KWD', 'BHD', 'OMR', 'JOD'].includes(currency) ? 3 : 2
    const num = convert(priceTRY).toLocaleString(currency === 'TRY' ? 'tr-TR' : 'en-US', {
      minimumFractionDigits: decimals, maximumFractionDigits: decimals,
    })
    return info.before ? `${info.symbol}${num}` : `${num} ${info.symbol}`
  }

  // تنسيق سعر بالليرة دائماً (للدفع/الملاحظات)
  function formatTRY(priceTRY) {
    return `₺${(Number(priceTRY) || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // اختيار يدويّ ثابت
  function changeCurrency(code) {
    if (!CURRENCIES[code]) return
    setCurrencyState(code)
    writeLS(PREF_KEY, code)
  }

  function getPrice(size) {
    return size?.price_try || size?.price || 0
  }

  return (
    <CurrencyContext.Provider value={{
      currency, rates, loading,
      convert, formatPrice, formatTRY, changeCurrency, getPrice,
      isTRY: currency === 'TRY',
      currencyInfo: CURRENCIES[currency] || CURRENCIES.TRY,
      allCurrencies: CURRENCIES,
      country: 'TR',
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
