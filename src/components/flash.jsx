import { useEffect, useState } from 'react'
import Icon from './Icon'

// הודעת אישור קצרה בתחתית המסך (למשל "הבקשה של דנה אושרה")
export const flash = (text, kind = 'ok') => window.dispatchEvent(new CustomEvent('shutafim:flash', { detail: { text, kind } }))

export function FlashHost() {
  const [item, setItem] = useState(null)
  useEffect(() => {
    let t
    const h = e => { setItem({ ...e.detail, id: Math.random() }); clearTimeout(t); t = setTimeout(() => setItem(null), 4500) }
    window.addEventListener('shutafim:flash', h)
    return () => { window.removeEventListener('shutafim:flash', h); clearTimeout(t) }
  }, [])
  if (!item) return null
  return <div className={'flash ' + item.kind} role="status" key={item.id}><Icon n={item.kind === 'ok' ? 'shield' : 'x'} size={18} />{item.text}</div>
}
