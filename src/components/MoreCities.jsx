import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

// כפתור "עוד ערים": רשימה מסודרת עם חיפוש, כדי שהשורה לא תתארך ככל שמצטרפות ערים
export default function MoreCities({ cities, selected, onPick }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef()
  useEffect(() => {
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [])
  const list = cities.filter(c => c.name.includes(q.trim()))
  return (
    <div className="morecities" ref={ref}>
      <button className="pill" aria-expanded={open} onClick={() => setOpen(o => !o)}>עוד ערים <Icon n="plus" size={14} /></button>
      {open && (
        <div className="citypop">
          <input autoFocus placeholder="חיפוש עיר" value={q} onChange={e => setQ(e.target.value)} />
          <div className="citylist">
            {list.length === 0 && <p className="meta">לא נמצאה עיר</p>}
            {list.map(c => (
              <button key={c.name} className={c.name === selected ? 'on' : ''} onClick={() => { onPick(c.name); setOpen(false); setQ('') }}>
                <span>{c.name}</span><small>{c.count}</small>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
