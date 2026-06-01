const shimmerStyle = {
  background: 'linear-gradient(90deg, #E2C9A8 25%, #f4e4c8 50%, #E2C9A8 75%)',
  backgroundSize: '800px 100%',
  animation: 'aromena-shimmer 1.6s infinite linear',
  borderRadius: 8,
}

export function SkeletonProductCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #E2C9A8' }}>
      <div style={{ ...shimmerStyle, height: 155, borderRadius: 0 }} />
      <div style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ ...shimmerStyle, height: 14, width: '75%' }} />
        <div style={{ ...shimmerStyle, height: 11, width: '45%' }} />
        <div style={{ ...shimmerStyle, height: 11, width: '35%' }} />
        <div style={{ ...shimmerStyle, height: 36, borderRadius: 10, marginTop: 4 }} />
      </div>
    </div>
  )
}

export function SkeletonPackageCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', border: '1px solid #E2C9A8' }}>
      <div style={{ ...shimmerStyle, height: 260, borderRadius: 0 }} />
      <div style={{ padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ ...shimmerStyle, height: 18, width: '60%' }} />
        <div style={{ ...shimmerStyle, height: 12, width: '40%' }} />
        <div style={{ ...shimmerStyle, height: 12, width: '80%' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{ ...shimmerStyle, width: 62, height: 62, borderRadius: '50%' }} />
              <div style={{ ...shimmerStyle, height: 10, width: 50 }} />
            </div>
          ))}
        </div>
        <div style={{ ...shimmerStyle, height: 26, width: '40%', marginTop: 4 }} />
        <div style={{ ...shimmerStyle, height: 44, borderRadius: 12, marginTop: 4 }} />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8, type = 'product' }) {
  return (
    <>
      <style>{`
        @keyframes aromena-shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>
      <div style={{
        display: 'grid',
        gridTemplateColumns: type === 'package'
          ? 'repeat(auto-fit, minmax(300px, 1fr))'
          : 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: type === 'package' ? 24 : 18,
      }}>
        {Array.from({ length: count }).map((_, i) =>
          type === 'package'
            ? <SkeletonPackageCard key={i} />
            : <SkeletonProductCard key={i} />
        )}
      </div>
    </>
  )
}