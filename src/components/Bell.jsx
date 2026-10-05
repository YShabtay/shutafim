import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useChatDock } from './ChatDock'
import Icon from './Icon'

const text = n => {
  const who = n.actor_name || 'מישהו'
  if (n.kind === 'application') return <><b>{who}</b> הגיש/ה בקשה לדירה "{n.post_title}"</>
  if (n.kind === 'accepted') return <>הבקשה שלך לדירה "{n.post_title}" <b>אושרה</b>. אפשר לפתוח צ'אט</>
  if (n.kind === 'declined') return <>הבקשה שלך לדירה "{n.post_title}" לא אושרה הפעם</>
  return <>הודעה חדשה מ-<b>{who}</b></>
}
const ago = iso => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  return m < 1 ? 'עכשיו' : m < 60 ? `לפני ${m} דק׳` : m < 1440 ? `לפני ${Math.round(m / 60)} שע׳` : `לפני ${Math.round(m / 1440)} ימים`
}

export default function Bell() {
  const { openChat, isOpen } = useChatDock()
  const nav = useNavigate()
  const [list, setList] = useState([])
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const seen = useRef(null)
  const isOpenRef = useRef(isOpen); isOpenRef.current = isOpen // תמיד המצב העדכני של החלונות
  const wrap = useRef()

  const load = async () => {
    let l
    try { l = await api.listNotifications() } catch { return } // למשל כשהטבלה עוד לא קיימת
    // התראות הודעה על שיחה שפתוחה כרגע נסגרות מיד
    const open_ = l.filter(n => !n.read && n.kind === 'message' && isOpenRef.current(n.conversation_id))
    if (open_.length) { open_.forEach(n => api.markConversationRead(n.conversation_id)); l.forEach(n => { if (open_.includes(n)) n.read = true }) }
    setList(l)
    const keys = l.filter(n => !n.read).map(n => n.id + '|' + n.created_at)
    if (seen.current === null) { seen.current = new Set(keys); return }
    const fresh = l.find(n => !n.read && !seen.current.has(n.id + '|' + n.created_at))
    keys.forEach(k => seen.current.add(k))
    if (fresh) { setToast(fresh); setTimeout(() => setToast(t => (t === fresh ? null : t)), 7000) }
  }
  useEffect(() => { load(); return api.subscribeNotifications(load) }, [])
  useEffect(() => {
    const close = e => { if (!wrap.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close)
  }, [])

  const unread = list.filter(n => !n.read).length
  const go = async n => {
    setOpen(false); setToast(null)
    await api.markNotificationRead(n.id); load()
    if (n.kind === 'message') openChat(n.conversation_id)
    else if (n.kind === 'application') nav('/inbox?tab=incoming')
    else if (n.kind === 'accepted') { const a = await api.getMyApplication(n.post_id); a?.conversation_id ? openChat(a.conversation_id) : nav(`/post/${n.post_id}`) }
    else nav('/inbox?tab=sent')
  }

  return (
    <div className="bell" ref={wrap}>
      <button className="themebtn" aria-label={unread ? `${unread} התראות חדשות` : 'התראות'} aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Icon n="bell" size={18} />
        {unread > 0 && <i className="bellbadge">{unread > 9 ? '9+' : unread}</i>}
      </button>
      {open && (
        <div className="belldrop">
          <div className="bellhead"><b>התראות</b>{unread > 0 && <button onClick={async () => { await api.markAllNotificationsRead(); load() }}>סימון הכל כנקרא</button>}</div>
          {list.length === 0 && <p className="meta bellempty">אין התראות עדיין. כשתגיע בקשה או הודעה, תראו אותן כאן.</p>}
          <div className="belllist">
            {list.map(n => (
              <button key={n.id} className={'bellitem' + (n.read ? '' : ' unread')} onClick={() => go(n)}>
                <span className={'bellico ' + n.kind}><Icon n={n.kind === 'message' ? 'chat' : n.kind === 'declined' ? 'x' : n.kind === 'accepted' ? 'shield' : 'users'} size={16} /></span>
                <span className="belltext"><span>{text(n)}</span><small>{ago(n.created_at)}</small></span>
                {!n.read && <i className="udot2" />}
              </button>
            ))}
          </div>
        </div>
      )}
      {toast && (
        <button className="toast" onClick={() => go(toast)}>
          <span className={'bellico ' + toast.kind}><Icon n={toast.kind === 'message' ? 'chat' : toast.kind === 'declined' ? 'x' : toast.kind === 'accepted' ? 'shield' : 'users'} size={16} /></span>
          <span className="belltext">{text(toast)}</span>
        </button>
      )}
    </div>
  )
}
