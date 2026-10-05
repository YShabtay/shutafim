import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useChatDock } from './ChatDock'
import { NotifIcon, ago, notifText, useOpenNotification } from './notifications'
import Avatar from './Avatar'
import { flash } from './flash'
import Icon from './Icon'

// פעמון: בקשות שממתינות לאישור (אפשר לאשר או לדחות ישר מכאן) ועדכונים על בקשות ששלחתי
export default function Bell({ notifs }) {
  const { openChat } = useChatDock()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(null)
  const wrap = useRef()
  const go = useOpenNotification(notifs.reload)
  useEffect(() => {
    const close = e => { if (!wrap.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close)
  }, [])
  const reqs = notifs.requests
  const updates = notifs.list.filter(n => n.kind === 'accepted' || n.kind === 'declined')
  const unreadUpdates = updates.filter(n => !n.read)
  const total = reqs.length + unreadUpdates.length

  const decide = async (a, status) => {
    setBusy(a.id)
    try {
      const conv = await api.setApplicationStatus(a.id, status)
      await notifs.reload()
      const who = a.profile?.first_name || 'המבקש/ת'
      if (status === 'accepted') flash(`הבקשה של ${who} אושרה. הצ'אט נפתח`); else flash(`הבקשה של ${who} נדחתה`, 'no')
      if (status === 'accepted' && conv) { setOpen(false); openChat(conv.id) }
    } finally { setBusy(null) }
  }

  return (
    <div className="bell" ref={wrap}>
      <button className="themebtn" aria-label={total ? `${total} התראות חדשות` : 'התראות'} aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Icon n="bell" size={18} />
        {total > 0 && <i className="bellbadge">{total > 9 ? '9+' : total}</i>}
      </button>
      {open && (
        <div className="belldrop wide">
          <div className="bellhead"><b>התראות</b><Link to="/inbox?tab=incoming" onClick={() => setOpen(false)}>לכל הבקשות</Link></div>
          {reqs.length === 0 && updates.length === 0 && <p className="meta bellempty">אין התראות עדיין. כשתגיע בקשה לדירה שלך, תוכלו לאשר אותה מכאן.</p>}
          <div className="belllist">
            {reqs.length > 0 && <div className="bellsec">בקשות שממתינות לאישור ({reqs.length})</div>}
            {reqs.map(a => (
              <div key={a.id} className="reqrow">
                <div className="reqtop">
                  <Avatar profile={a.profile || { first_name: '?' }} size={38} />
                  <div className="belltext">
                    <span><b>{a.profile?.first_name || 'מישהו'}{a.profile?.age ? `, ${a.profile.age}` : ''}</b> מבקש/ת להצטרף</span>
                    <small>{a.post?.title}</small>
                  </div>
                </div>
                {a.message && <p className="reqmsg">{a.message}</p>}
                <div className="reqbtns">
                  <button className="btn primary" disabled={busy === a.id} onClick={() => decide(a, 'accepted')}>אישור</button>
                  <button className="btn ghost" disabled={busy === a.id} onClick={() => decide(a, 'declined')}>דחייה</button>
                  <Link className="reqlink" to={`/inbox?tab=incoming&post=${a.post_id}`} onClick={() => setOpen(false)}>פרופיל מלא</Link>
                </div>
              </div>
            ))}
            {updates.length > 0 && <div className="bellsec">עדכונים</div>}
            {updates.map(n => (
              <button key={n.id} className={'bellitem' + (n.read ? '' : ' unread')} onClick={() => { setOpen(false); go(n) }}>
                <NotifIcon kind={n.kind} />
                <span className="belltext"><span>{notifText(n)}</span><small>{ago(n.created_at)}</small></span>
                {!n.read && <i className="udot2" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
