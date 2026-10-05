import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useChatDock } from './ChatDock'
import Icon from './Icon'

export const notifText = n => {
  const who = n.actor_name || 'מישהו'
  if (n.kind === 'application') return <><b>{who}</b> הגיש/ה בקשה לדירה "{n.post_title}"</>
  if (n.kind === 'accepted') return <>הבקשה שלך לדירה "{n.post_title}" <b>אושרה</b>. אפשר לפתוח צ'אט</>
  if (n.kind === 'declined') return <>הבקשה שלך לדירה "{n.post_title}" לא אושרה הפעם</>
  return <>הודעה חדשה מ-<b>{who}</b></>
}
export const ago = iso => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  return m < 1 ? 'עכשיו' : m < 60 ? `לפני ${m} דק׳` : m < 1440 ? `לפני ${Math.round(m / 60)} שע׳` : `לפני ${Math.round(m / 1440)} ימים`
}
export function NotifIcon({ kind }) {
  return <span className={'bellico ' + kind}><Icon n={kind === 'message' ? 'chat' : kind === 'declined' ? 'x' : kind === 'accepted' ? 'shield' : 'users'} size={16} /></span>
}

// מצב ההתראות במקום אחד: משמש גם את הפעמון (בקשות) וגם את אייקון ההודעות
export function useNotifications(enabled) {
  const { isOpen } = useChatDock()
  const [list, setList] = useState([])
  const [toast, setToast] = useState(null)
  const seen = useRef(null)
  const isOpenRef = useRef(isOpen); isOpenRef.current = isOpen

  const load = async () => {
    let l
    try { l = await api.listNotifications() } catch { return }
    const open_ = l.filter(n => !n.read && n.kind === 'message' && isOpenRef.current(n.conversation_id)) // שיחה שפתוחה כבר נקראה
    if (open_.length) { open_.forEach(n => api.markConversationRead(n.conversation_id)); open_.forEach(n => { n.read = true }) }
    setList(l)
    const keys = l.filter(n => !n.read).map(n => n.id + '|' + n.created_at)
    if (seen.current === null) { seen.current = new Set(keys); return }
    const fresh = l.find(n => !n.read && !seen.current.has(n.id + '|' + n.created_at))
    keys.forEach(k => seen.current.add(k))
    if (fresh) { setToast(fresh); setTimeout(() => setToast(t => (t === fresh ? null : t)), 7000) }
  }
  useEffect(() => {
    if (!enabled) { setList([]); seen.current = null; return }
    load(); return api.subscribeNotifications(load)
  }, [enabled])
  return { list, reload: load, toast, setToast }
}

// פותח את מה שההתראה מצביעה עליו
export function useOpenNotification(reload) {
  const nav = useNavigate()
  const { openChat } = useChatDock()
  return async n => {
    await api.markNotificationRead(n.id); reload()
    if (n.kind === 'message') openChat(n.conversation_id)
    else if (n.kind === 'application') nav(`/inbox?tab=incoming&post=${n.post_id}`)
    else if (n.kind === 'accepted') { const a = await api.getMyApplication(n.post_id); a?.conversation_id ? openChat(a.conversation_id) : nav('/inbox?tab=sent') }
    else nav('/inbox?tab=sent')
  }
}

export function Toast({ notifs }) {
  const open = useOpenNotification(notifs.reload)
  const n = notifs.toast
  if (!n) return null
  return <button className="toast" onClick={() => { notifs.setToast(null); open(n) }}><NotifIcon kind={n.kind} /><span className="belltext">{notifText(n)}</span></button>
}
