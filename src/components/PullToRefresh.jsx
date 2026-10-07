import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'

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
  const T = TRIGGER * 0.5
  const p = Math.min(1, pull / T)
  const ready = p >= 1
  const C = 94.25 // היקף העיגול (רדיוס 15)
  return (
    <div className={'ptr' + (ready ? ' ready' : '') + (busy ? ' busy' : '')} style={{ transform: `translate(-50%, ${pull}px) scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, pull / 24) }} aria-hidden="true">
      <svg className="ptrring" viewBox="0 0 36 36" width="48" height="48">
        <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(20,25,45,.1)" strokeWidth="2.5" />
        <circle className="ptrarc" cx="18" cy="18" r="15" fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={busy ? '28 66' : C} strokeDashoffset={busy ? 0 : C * (1 - p)} />
      </svg>
      <span className="ptrlogo"><Logo size={24} /></span>
    </div>
  )
}
