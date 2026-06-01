import { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { FiTrendingUp, FiTrendingDown, FiUsers, FiGlobe, FiCalendar, FiAward } from 'react-icons/fi'

const FLAG_API = 'https://flagcdn.com/24x18'

const BORDEAUX = '#7b192c'
const GOLD     = '#f4be69'
const BG       = '#F5E6D3'
const BG2      = '#EDD9C0'
const CARD     = '#ffffff'
const TEXT     = '#3E1C00'
const TEXT2    = '#9C6B4E'
const BORDER   = '#E2C9A8'

export default function AdminMarketing() {
  const [visitors,  setVisitors]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [period,    setPeriod]    = useState(7)

  useEffect(() => { loadVisitors() }, [period])

  async function loadVisitors() {
    setLoading(true)
    try {
      const q = query(collection(db, 'visitors'), orderBy('date', 'desc'), limit(period))
      const snap = await getDocs(q)
      setVisitors(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Marketing load error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── إحصائيات ──
  const todayStr = new Date().toISOString().split('T')[0]

  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0]

  const totalVisitors  = visitors.reduce((s, d) => s + (d.count || 0), 0)
  const todayCount     = visitors.find(d => d.date === todayStr)?.count || 0
  const yesterdayCount = visitors.find(d => d.date === yesterdayStr)?.count || 0
  const avgDaily       = visitors.length > 0 ? Math.round(totalVisitors / visitors.length) : 0
  const topDay         = visitors.reduce((max, d) => (d.count || 0) > (max?.count || 0) ? d : max, null)

  const growthPercent = yesterdayCount > 0
    ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100)
    : todayCount > 0 ? 100 : 0

  const isGrowthPos = growthPercent >= 0

  // ── الدول ──
  const allCountries = {}
  visitors.forEach(day => {
    if (!day.countries) return
    Object.entries(day.countries).forEach(([code, info]) => {
      if (!allCountries[code]) allCountries[code] = { name: info.name, code, count: 0 }
      allCountries[code].count += info.count || 0
    })
  })
  const sortedCountries = Object.values(allCountries).sort((a, b) => b.count - a.count)
  const maxCountry = sortedCountries[0]?.count || 1

  const statCards = [
    {
      label: 'زوار اليوم',
      value: todayCount,
      icon: <FiUsers size={18} />,
      sub: isGrowthPos ? `+${growthPercent}% عن أمس` : `${growthPercent}% عن أمس`,
      subColor: isGrowthPos ? '#16A34A' : '#DC2626',
      subIcon: isGrowthPos ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />,
    },
    {
      label: `إجمالي ${period} أيام`,
      value: totalVisitors.toLocaleString(),
      icon: <FiCalendar size={18} />,
      sub: `متوسط ${avgDaily} زائر/يوم`,
      subColor: TEXT2,
    },
    {
      label: 'أعلى يوم',
      value: topDay?.count || 0,
      icon: <FiAward size={18} />,
      sub: topDay ? new Date(topDay.date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }) : '—',
      subColor: TEXT2,
    },
    {
      label: 'الدول',
      value: sortedCountries.length,
      icon: <FiGlobe size={18} />,
      sub: sortedCountries[0]?.name || '—',
      subColor: TEXT2,
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', color: TEXT, fontFamily: 'Amiri, serif' }}>التسويق والزوار</h1>
          <p style={{ color: TEXT2, fontSize: '0.85rem' }}>تحليل زوار الموقع</p>
        </div>

        {/* فترة العرض */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[7, 14, 30].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '7px 16px', borderRadius: 50, border: '2px solid',
              borderColor: period === p ? BORDEAUX : BORDER,
              background: period === p ? `linear-gradient(to left, ${BORDEAUX}, #a82040)` : CARD,
              color: period === p ? GOLD : '#6B3A2A',
              fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
              fontFamily: 'Amiri, serif', transition: 'all 0.15s',
            }}>
              {p} يوم
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 110, borderRadius: 18, background: BG, animation: 'pulse 1.2s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
            {statCards.map((s, i) => (
              <div key={i} style={{
                background: CARD, borderRadius: 18, padding: '20px',
                border: `1px solid ${BORDER}`,
                boxShadow: '0 2px 10px rgba(62,28,0,0.05)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <p style={{ color: TEXT2, fontSize: '0.8rem', fontWeight: 600 }}>{s.label}</p>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `linear-gradient(135deg, ${BORDEAUX}, #a82040)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: GOLD, flexShrink: 0,
                  }}>
                    {s.icon}
                  </div>
                </div>
                <p style={{ color: TEXT, fontWeight: 900, fontSize: '1.8rem', lineHeight: 1, marginBottom: 8 }}>
                  {s.value}
                </p>
                <p style={{ color: s.subColor, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {s.subIcon}{s.sub}
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>

            {/* Chart الزوار اليومي */}
            <div style={{
              background: CARD, borderRadius: 20, padding: '24px',
              border: `1px solid ${BORDER}`,
              boxShadow: '0 2px 10px rgba(62,28,0,0.05)',
            }}>
              <h3 style={{ color: TEXT, fontWeight: 700, marginBottom: 20, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiCalendar size={15} color={BORDEAUX} /> الزوار اليومي
              </h3>

              {visitors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: TEXT2, fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
                  لا يوجد بيانات بعد
                </div>
              ) : (() => {
                const reversed = [...visitors].reverse()
                const maxCount = Math.max(...reversed.map(d => d.count || 0)) || 1
                return (
                  <div>
                    {/* Bar Chart */}
                    <div style={{
                      display: 'flex', alignItems: 'flex-end', gap: 5,
                      height: 120, marginBottom: 8,
                    }}>
                      {reversed.map((day, idx) => {
                        const pct = ((day.count || 0) / maxCount) * 100
                        const isToday = day.date === todayStr
                        return (
                          <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <span style={{ color: isToday ? BORDEAUX : TEXT2, fontSize: '0.65rem', fontWeight: isToday ? 700 : 400 }}>
                              {day.count || 0}
                            </span>
                            <div
                              title={`${day.date}: ${day.count || 0} زائر`}
                              style={{
                                width: '100%', borderRadius: '4px 4px 0 0',
                                height: `${Math.max(pct, 4)}%`,
                                background: isToday
                                  ? `linear-gradient(to top, ${BORDEAUX}, #a82040)`
                                  : BG2,
                                transition: 'height 0.5s ease',
                                cursor: 'pointer',
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>

                    {/* محاور التواريخ */}
                    <div style={{ display: 'flex', gap: 5 }}>
                      {reversed.map((day, idx) => {
                        const isToday = day.date === todayStr
                        const d = new Date(day.date)
                        return (
                          <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                            <p style={{ color: isToday ? BORDEAUX : TEXT2, fontSize: '0.6rem', fontWeight: isToday ? 700 : 400 }}>
                              {isToday ? 'اليوم' : `${d.getDate()}/${d.getMonth()+1}`}
                            </p>
                          </div>
                        )
                      })}
                    </div>

                    {/* خط فاصل */}
                    <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 4 }} />
                  </div>
                )
              })()}
            </div>

            {/* الدول */}
            <div style={{
              background: CARD, borderRadius: 20, padding: '24px',
              border: `1px solid ${BORDER}`,
              boxShadow: '0 2px 10px rgba(62,28,0,0.05)',
            }}>
              <h3 style={{ color: TEXT, fontWeight: 700, marginBottom: 20, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiGlobe size={15} color={BORDEAUX} /> الزوار حسب الدولة
              </h3>

              {sortedCountries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: TEXT2, fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>🌍</div>
                  لا يوجد بيانات بعد
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {sortedCountries.slice(0, 8).map((country, idx) => {
                    const pct = Math.round((country.count / totalVisitors) * 100)
                    const barPct = Math.round((country.count / maxCountry) * 100)
                    const isTop = idx === 0
                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {isTop && (
                              <span style={{ fontSize: '0.8rem' }}>🥇</span>
                            )}
                            <img
                              src={`${FLAG_API}/${country.code.toLowerCase()}.png`}
                              alt={country.name}
                              style={{ width: 22, height: 16, borderRadius: 3, objectFit: 'cover' }}
                              onError={e => e.target.style.display = 'none'}
                            />
                            <span style={{ color: TEXT, fontSize: '0.83rem', fontWeight: isTop ? 700 : 500 }}>
                              {country.name}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: TEXT2, fontSize: '0.72rem' }}>{pct}%</span>
                            <span style={{
                              background: isTop ? `rgba(123,25,44,0.08)` : BG,
                              color: isTop ? BORDEAUX : TEXT2,
                              padding: '2px 9px', borderRadius: 50,
                              fontSize: '0.73rem', fontWeight: 700,
                              border: `1px solid ${isTop ? 'rgba(123,25,44,0.15)' : BORDER}`,
                            }}>
                              {country.count}
                            </span>
                          </div>
                        </div>
                        <div style={{ height: 6, background: BG, borderRadius: 50, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 50,
                            width: `${barPct}%`,
                            background: isTop
                              ? `linear-gradient(to left, ${BORDEAUX}, #a82040)`
                              : idx === 1 ? BG2 : BORDER,
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* جدول الأيام */}
          <div style={{
            background: CARD, borderRadius: 20, padding: '24px',
            border: `1px solid ${BORDER}`,
            boxShadow: '0 2px 10px rgba(62,28,0,0.05)',
            marginTop: 20,
          }}>
            <h3 style={{ color: TEXT, fontWeight: 700, marginBottom: 20, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiCalendar size={15} color={BORDEAUX} /> تفاصيل الأيام
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: BG }}>
                    {['التاريخ', 'الزوار', 'الدول', 'أكثر دولة'].map((h, i) => (
                      <th key={i} style={{
                        padding: '12px 16px', textAlign: 'right', color: '#6B3A2A',
                        fontSize: '0.82rem', fontWeight: 700,
                        borderBottom: `1px solid ${BORDER}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((day, i) => {
                    const countries = Object.values(day.countries || {})
                    const topCountry = [...countries].sort((a, b) => b.count - a.count)[0]
                    const isToday = day.date === todayStr
                    return (
                      <tr key={i} style={{
                        borderBottom: `1px solid ${BG}`,
                        background: isToday ? 'rgba(123,25,44,0.04)' : i % 2 === 0 ? CARD : '#FFFBF5',
                      }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {isToday && (
                              <span style={{
                                background: `linear-gradient(to left, ${BORDEAUX}, #a82040)`,
                                color: GOLD,
                                padding: '1px 9px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 700,
                              }}>اليوم</span>
                            )}
                            <span style={{ color: TEXT, fontSize: '0.85rem', fontWeight: isToday ? 700 : 400 }}>
                              {new Date(day.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ color: BORDEAUX, fontWeight: 900, fontSize: '1rem' }}>
                            {day.count || 0}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#6B3A2A', fontSize: '0.85rem' }}>
                          {countries.length} دولة
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {topCountry ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <img
                                src={`${FLAG_API}/${topCountry.code?.toLowerCase()}.png`}
                                alt={topCountry.name}
                                style={{ width: 20, height: 15, borderRadius: 2, objectFit: 'cover' }}
                                onError={e => e.target.style.display = 'none'}
                              />
                              <span style={{ color: TEXT, fontSize: '0.82rem', fontWeight: 600 }}>
                                {topCountry.name}
                              </span>
                              <span style={{ color: TEXT2, fontSize: '0.75rem' }}>
                                ({topCountry.count})
                              </span>
                            </div>
                          ) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}