import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import NotifPanel from './NotifPanel'
import Icon from './Icon'

// פעמון בכותרת (מחשב): תפריט נפתח עם ההתראות. בנייד משתמשים בעמוד /notifications.
export default function Bell({ notifs }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef()
  useEffect(() => {
    const close = e => { if (!wrap.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close)
  }, [])
  const total = notifs.requests.length + notifs.list.filter(n => !n.read && (n.kind === 'accepted' || n.kind === 'declined' || n.kind === 'chatting')).length
  return (
    <div className="bell bellmenu" ref={wrap}>
      <button className="themebtn" aria-label={total ? `${total} התראות חדשות` : 'התראות'} aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Icon n="bell" size={18} />
        {total > 0 && <i className="bellbadge">{total > 9 ? '9+' : total}</i>}
      </button>
      {open && (
        <div className="belldrop wide">
          <div className="bellhead"><b>התראות</b><Link to="/inbox?tab=incoming" onClick={() => setOpen(false)}>לכל הבקשות</Link></div>
          <NotifPanel notifs={notifs} onDone={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
