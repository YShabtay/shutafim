import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

const TRIGGER = 80
const SKIP = '.cwin, .dock, .leaflet-container, .modal, .confirm, textarea, input, select'

// גרירה מטה בראש הדף מרעננת את האתר (באפליקציה מהמסך הבית אין רענון מובנה)
export default function PullToRefresh() {
  const [pull, setPull] = useState(0)
  const [busy, setBusy] = useState(false)
  const start = useRef(null)
  const cur = useRef(0)

  useEffect(() => {
    const down = e => {
      start.current = null
      if (window.scrollY > 0 || e.target.closest?.(SKIP)) return
      start.current = e.touches[0].clientY
    }
    const move = e => {
      if (start.current == null) return
      const dy = e.touches[0].clientY - start.current
      if (dy <= 0 || window.scrollY > 0) { cur.current = 0; setPull(0); return }
      cur.current = Math.min(dy * 0.5, 110)
      setPull(cur.current)
    }
    const up = () => {
      if (start.current == null) return
      start.current = null
      if (cur.current >= TRIGGER * 0.5) { setBusy(true); setPull(TRIGGER * 0.5); setTimeout(() => location.reload(), 350) }
      else setPull(0)
      cur.current = 0
    }
    window.addEventListener('touchstart', down, { passive: true })
    window.addEventListener('touchmove', move, { passive: true })
    window.addEventListener('touchend', up)
    window.addEventListener('touchcancel', up)
    return () => { window.removeEventListener('touchstart', down); window.removeEventListener('touchmove', move); window.removeEventListener('touchend', up); window.removeEventListener('touchcancel', up) }
  }, [])

  if (!pull && !busy) return null
  const ready = pull >= TRIGGER * 0.5
  return (
    <div className="ptr" style={{ transform: `translate(-50%, ${pull}px)`, opacity: Math.min(1, pull / 30) }} aria-hidden="true">
      <span className={busy ? 'spin' : ''} style={busy ? undefined : { transform: `rotate(${ready ? 180 : pull * 3}deg)` }}><Icon n="arrow" size={18} className="ptrarrow" /></span>
    </div>
  )
}
