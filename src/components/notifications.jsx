import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useChatDock } from './ChatDock'
import Icon from './Icon'
import { markSeen } from '../seen'

export const notifText = n => {
  const who = n.actor_name || 'מישהו'
  if (n.kind === 'application') return <><b>{who}</b> הגיש/ה בקשה לדירה "{n.post_title}"</>
  if (n.kind === 'chatting') return <><b>{who}</b> פתח/ה איתך שיחה לגבי הדירה "{n.post_title}"</>
  if (n.kind === 'accepted') return <>אושרת כשותף/ה לדירה "{n.post_title}"!</>
  if (n.kind === 'declined') return <>הבקשה שלך לדירה "{n.post_title}" לא אושרה הפעם</>
  return <>הודעה חדשה מ-<b>{who}</b></>
}
export const ago = iso => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  return m < 1 ? 'עכשיו' : m < 60 ? `לפני ${m} דק׳` : m < 1440 ? `לפני ${Math.round(m / 60)} שע׳` : `לפני ${Math.round(m / 1440)} ימים`
}
export function NotifIcon({ kind }) {
  return <span className={'bellico ' + kind}><Icon n={kind === 'message' || kind === 'chatting' ? 'chat' : kind === 'declined' ? 'x' : kind === 'accepted' ? 'shield' : 'users'} size={16} /></span>
}

// מצב ההתראות במקום אחד: משמש גם את הפעמון (בקשות) וגם את אייקון ההודעות
export function useNotifications(enabled) {
  const [list, setList] = useState([])
  const [requests, setRequests] = useState([]) // בקשות חדשות שממתינות לי, מכל הדירות
  const [inTalks, setInTalks] = useState([])   // בקשות שאני בשיחה איתן ועוד לא החלטתי
  const [toast, setToast] = useState(null)
  const seen = useRef(null)

  const load = async () => {
    let l
    try { l = (await api.listNotifications()).filter(n => n.kind !== 'message') } catch { return } // הודעות מחושבות בנפרד, מהשיחות עצמן
    setList(l)
    try { const inc = await api.listAllIncoming(); setRequests(inc.filter(a => a.status === 'pending')); setInTalks(inc.filter(a => a.status === 'chatting')) } catch {}
    const keys = l.filter(n => !n.read).map(n => n.id + '|' + n.created_at)
    if (seen.current === null) { seen.current = new Set(keys); return }
    const fresh = l.find(n => !n.read && !seen.current.has(n.id + '|' + n.created_at))
    keys.forEach(k => seen.current.add(k))
    if (fresh) { setToast(fresh); setTimeout(() => setToast(t => (t === fresh ? null : t)), 7000) }
  }
  useEffect(() => {
    if (!enabled) { setList([]); setRequests([]); setInTalks([]); seen.current = null; return }
    load(); return api.subscribeNotifications(load)
  }, [enabled])
  return { list, requests, inTalks, reload: load, toast, setToast }
}

// פותח את מה שההתראה מצביעה עליו
export function useOpenNotification(reload) {
  const nav = useNavigate()
  const { openChat } = useChatDock()
  return async n => {
    await api.markNotificationRead(n.id); reload()
    if (n.kind === 'message') openChat(n.conversation_id)
    else if (n.kind === 'application') nav(`/inbox?tab=incoming&post=${n.post_id}`)
    else if (n.kind === 'accepted' || n.kind === 'chatting') { const a = await api.getMyApplication(n.post_id); a?.conversation_id ? openChat(a.conversation_id) : nav('/inbox?tab=sent') }
    else nav('/inbox?tab=sent')
  }
}

export function Toast({ notifs }) {
  const open = useOpenNotification(notifs.reload)
  const n = notifs.toast
  if (!n) return null
  return <button className="toast" onClick={() => { notifs.setToast(null); open(n) }}><NotifIcon kind={n.kind} /><span className="belltext">{notifText(n)}</span></button>
}

export function MessageToast({ msgs, userId }) {
  const { openChat } = useChatDock()
  const t = msgs.toast
  if (!t) return null
  return (
    <button className="toast second" onClick={() => { msgs.setToast(null); markSeen(userId, t.conversation_id, t.key); openChat(t.conversation_id) }}>
      <NotifIcon kind="message" /><span className="belltext">הודעה חדשה מ-<b>{t.actor_name || 'משתמש'}</b></span>
    </button>
  )
}
