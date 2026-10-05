import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { NotifIcon, ago, notifText, useOpenNotification } from './notifications'
import Icon from './Icon'

// פעמון: התראות על בקשות (חדשה, אושרה, נדחתה). הודעות צ'אט נמצאות באייקון ההודעות.
export default function Bell({ notifs }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef()
  const go = useOpenNotification(notifs.reload)
  useEffect(() => {
    const close = e => { if (!wrap.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close)
  }, [])
  const list = notifs.list.filter(n => n.kind !== 'message')
  const unread = list.filter(n => !n.read).length
  return (
    <div className="bell" ref={wrap}>
      <button className="themebtn" aria-label={unread ? `${unread} התראות חדשות` : 'התראות'} aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Icon n="bell" size={18} />
        {unread > 0 && <i className="bellbadge">{unread > 9 ? '9+' : unread}</i>}
      </button>
      {open && (
        <div className="belldrop">
          <div className="bellhead"><b>התראות</b>{unread > 0 && <button onClick={async () => { await Promise.all(list.filter(n => !n.read).map(n => api.markNotificationRead(n.id))); notifs.reload() }}>סימון הכל כנקרא</button>}</div>
          {list.length === 0 && <p className="meta bellempty">אין התראות עדיין. כשתגיע בקשה לדירה שלך, היא תופיע כאן.</p>}
          <div className="belllist">
            {list.map(n => (
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
