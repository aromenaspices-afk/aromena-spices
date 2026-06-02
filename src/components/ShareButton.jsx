import { FiShare2 } from 'react-icons/fi'

export default function ShareButton({ url, title, isAr = true, size = 'normal' }) {
  const shareUrl  = url   || window.location.href
  const shareText = title || (isAr ? 'شوف هاد المنتج من أرومينا!' : 'Check this from Aromena Spices!')

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, url: shareUrl })
      } catch (e) {}
    } else {
      navigator.clipboard?.writeText(shareUrl)
      alert(isAr ? 'تمَّ نسخ الرابط!' : 'Link copied!')
    }
  }

  const btnSize  = size === 'small' ? 32 : 36
  const iconSize = size === 'small' ? 13 : 15

  return (
    <button onClick={handleShare} title={isAr ? 'مشاركة' : 'Share'} style={{
      width: btnSize, height: btnSize, borderRadius: 8,
      background: 'transparent',
      border: '1px solid #E2C9A8',
      color: '#7b192c', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s', flexShrink: 0,
    }}
    onMouseEnter={e => { e.currentTarget.style.background = '#fdf0f2'; e.currentTarget.style.borderColor = '#7b192c' }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E2C9A8' }}
    >
      <FiShare2 size={iconSize} />
    </button>
  )
}