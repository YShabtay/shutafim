import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { useChatDock } from './ChatDock'
import { getSeen, markSeen } from '../seen'

// שיחות והודעות שלא נקראו, מחושבות ישירות מההודעות (לא תלוי בטבלת ההתראות)
export function useConversations(userId) {
  const { isOpen } = useChatDock()
  const isOpenRef = useRef(isOpen); isOpenRef.current = isOpen
  const [convs, setConvs] = useState([])
  const [, setTick] = useState(0)
  const [toast, setToast] = useState(null)
  const known = useRef(null)

  const load = async () => {
    let c
    try { c = await api.listConversations() } catch { return }
    setConvs(c)
    const next = {}
    for (const v of c) next[v.id] = v.last?.created_at || ''
    if (known.current === null) { known.current = next; return }
    for (const v of c) {
      const fromOther = v.last && v.last.sender_id !== userId
      if (fromOther && v.last.created_at !== known.current[v.id]) {
        if (isOpenRef.current(v.id)) markSeen(userId, v.id, v.last.created_at) // השיחה פתוחה: נקראה
        else { const t = { conversation_id: v.id, actor_name: v.other?.first_name || '', key: v.last.created_at }; setToast(t); setTimeout(() => setToast(x => (x === t ? null : x)), 7000) }
      }
    }
    known.current = next
  }

  useEffect(() => {
    known.current = null
    if (!userId) { setConvs([]); return }
    load()
    const off = api.subscribeAllMessages(load)
    const h = () => setTick(t => t + 1)
    window.addEventListener('shutafim:seen', h)
    return () => { off(); window.removeEventListener('shutafim:seen', h) }
  }, [userId])

  const seen = userId ? getSeen(userId) : {}
  const unread = new Set(convs.filter(c => c.last && c.last.sender_id !== userId && c.last.created_at > (seen[c.id] || '')).map(c => c.id))
  return { convs, unread, reload: load, toast, setToast }
}
