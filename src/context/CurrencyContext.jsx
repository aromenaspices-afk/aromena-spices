import { createContext, useContext, useState, useEffect } from 'react'

const CurrencyContext = createContext()

export const CURRENCIES = {
  EUR: { symbol: '€',   name: 'Euro',        flag: '🇪🇺' },
  USD: { symbol: '$',   name: 'US Dollar',   flag: '🇺🇸' },
  TRY: { symbol: '₺',  name: 'Türk Lirası', flag: '🇹🇷' },
  SAR: { symbol: 'ر.س', name: 'ريال سعودي', flag: '🇸🇦' },
  AED: { symbol: 'د.إ', name: 'درهم إماراتي',flag: '🇦🇪' },
  KWD: { symbol: 'د.ك', name: 'دينار كويتي',flag: '🇰🇼' },
  QAR: { symbol: 'ر.ق', name: 'ريال قطري',  flag: '🇶🇦' },
  BHD: { symbol: 'د.ب', name: 'دينار بحريني',flag: '🇧🇭' },
  OMR: { symbol: 'ر.ع', name: 'ريال عُماني', flag: '🇴🇲' },
}

const EXCHANGE_API_KEY = import.meta.env.VITE_EXCHANGERATE_API_KEY || '9242ee4806c6d1d9c52ee0c1'

export function CurrencyProvider({ children }) {
  // ثابت على TRY — تبديل العملات موقوف مؤقتاً
  const currency     = 'TRY'
  const [rates, setRates] = useState({ EUR: 1, TRY: 35 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRates() {
      try {
        const res  = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/EUR`)
        const data = await res.json()
        if (data.result === 'success') setRates(data.conversion_rates)
      } catch {
        // نستخدم الأسعار الافتراضية
      } finally {
        setLoading(false)
      }
    }
    fetchRates()
  }, [])

  function convert(priceInEur) {
    if (!priceInEur) return 0
    return priceInEur // الأسعار محفوظة بـ TRY مباشرة
  }

  function formatPrice(price) {
    const formatted = (price || 0).toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return `₺${formatted}`
  }

  // دالة مساعدة — تقرأ price_try إن وجد وإلا price
  function getPrice(size) {
    return size?.price_try || size?.price || 0
  }

  // موقوف — لا يغير شيئاً
  function changeCurrency(code) {}

  return (
    <CurrencyContext.Provider value={{
      currency, rates, loading,
      convert, formatPrice, changeCurrency, getPrice,
      currencyInfo: CURRENCIES.TRY,
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