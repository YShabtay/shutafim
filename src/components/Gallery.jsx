import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

// גלריית תמונות: מתחלפת לבד כל כמה שניות, נעצרת כשהעכבר או האצבע עליה, ואפשר לעבור ידנית עם חצים, נקודות והחלקה
export default function Gallery({ photos, interval = 4500 }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef(null)
  const n = photos.length
  const go = d => setI(x => (x + d + n) % n)

  useEffect(() => {
    if (n < 2 || paused) return
    const t = setInterval(() => setI(x => (x + 1) % n), interval)
    return () => clearInterval(t)
  }, [n, paused, interval, i])

  return (
    <div className="gal" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={e => { setPaused(true); touchX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - (touchX.current ?? 0)
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
        touchX.current = null; setTimeout(() => setPaused(false), 3000)
      }}>
      <div className="galtrack">
        {photos.map((u, k) => <img key={u} src={u} alt="" className={k === i ? 'on' : ''} loading={k === 0 ? 'eager' : 'lazy'} />)}
      </div>
      {n > 1 && <>
        <button type="button" className="galbtn next" aria-label="התמונה הבאה" onClick={() => go(1)}><Icon n="arrow" size={20} /></button>
        <button type="button" className="galbtn prev" aria-label="התמונה הקודמת" onClick={() => go(-1)}><Icon n="arrow" size={20} /></button>
        <div className="galdots">{photos.map((_, k) => <button type="button" key={k} aria-label={`תמונה ${k + 1}`} className={k === i ? 'on' : ''} onClick={() => setI(k)} />)}</div>
        <span className="galcount">{i + 1}/{n}</span>
      </>}
    </div>
  )
}
