import { useState, useEffect } from 'react'
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

// عارض صور بملء الشاشة (lightbox) — للبوكسات والمنتجات
export default function ImageLightbox({ images = [], startIndex = 0, onClose }) {
  const [i, setI] = useState(startIndex)

  useEffect(() => { setI(startIndex) }, [startIndex])

  useEffect(() => {
    const n = images.length
    function onKey(e) {
      if (e.key === 'Escape') onClose && onClose()
      else if (e.key === 'ArrowLeft') setI(p => (p + 1) % n)
      else if (e.key === 'ArrowRight') setI(p => (p - 1 + n) % n)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [images.length, onClose])

  if (!images.length) return null
  const multi = images.length > 1
  const arrowBtn = (side) => ({
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', [side]: 18,
    width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.14)',
    border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 2,
  })

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(15,5,10,0.94)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      backdropFilter: 'blur(4px)',
    }}>
      <button onClick={e => { e.stopPropagation(); onClose && onClose() }} style={{
        position: 'absolute', top: 18, insetInlineEnd: 18, width: 46, height: 46, borderRadius: '50%',
        background: 'rgba(255,255,255,0.14)', border: 'none', color: '#fff', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3,
      }}>
        <FiX size={22} />
      </button>

      {multi && (
        <>
          <button onClick={e => { e.stopPropagation(); setI(p => (p - 1 + images.length) % images.length) }} style={arrowBtn('right')}>
            <FiChevronRight size={26} />
          </button>
          <button onClick={e => { e.stopPropagation(); setI(p => (p + 1) % images.length) }} style={arrowBtn('left')}>
            <FiChevronLeft size={26} />
          </button>
        </>
      )}

      <img src={images[i]} alt="" onClick={e => e.stopPropagation()} style={{
        maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 12,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }} />

      {multi && (
        <div style={{
          position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif',
          background: 'rgba(255,255,255,0.12)', padding: '5px 14px', borderRadius: 50,
        }}>
          {i + 1} / {images.length}
        </div>
      )}
    </div>
  )
}
