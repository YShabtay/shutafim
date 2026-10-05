import { useEffect, useState } from 'react'
import Icon from './Icon'

const img = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=75`
const SLIDES = [
  { src: img('1772724317856-156cf12b366f'), alt: 'שלושה שותפים מבשלים יחד במטבח', caption: 'בישולים משותפים' },
  { src: img('1758525862263-af89b090fb56'), alt: 'שתי שותפות צופות בטלוויזיה עם פופקורן', caption: 'ערבי סרט בסלון' },
  { src: img('1772724317732-3942ffb02e28'), alt: 'חברים צופים במשחק ואוכלים חטיפים', caption: 'משחק בטלוויזיה, חברים בבית' },
  { src: img('1758525863581-50540e84f868'), alt: 'שתי שותפות צוחקות עם כוסות קפה', caption: 'קפה של בוקר עם שותפה טובה' },
]

export default function HeroCarousel({ children }) {
  const [i, setI] = useState(0)
  const [hover, setHover] = useState(false)
  const go = d => setI(x => (x + d + SLIDES.length) % SLIDES.length)
  useEffect(() => {
    if (hover) return
    const t = setInterval(() => go(1), 5500)
    return () => clearInterval(t)
  }, [hover])
  return (
    <section className="hero herobox" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {SLIDES.map((s, n) => <img key={s.src} className={'slide' + (n === i ? ' on' : '')} src={s.src} alt={n === i ? s.alt : ''} loading={n === 0 ? 'eager' : 'lazy'} />)}
      <div className="herocontent">{children}</div>
      <button className="car-btn prev" aria-label="הקודם" onClick={() => go(-1)}><Icon n="arrow" size={18} className="flip" /></button>
      <button className="car-btn next" aria-label="הבא" onClick={() => go(1)}><Icon n="arrow" size={18} /></button>
      <span className="caption">{SLIDES[i].caption}</span>
      <div className="dots">{SLIDES.map((_, n) => <button key={n} className={n === i ? 'on' : ''} aria-label={`תמונה ${n + 1}`} onClick={() => setI(n)} />)}</div>
    </section>
  )
}
