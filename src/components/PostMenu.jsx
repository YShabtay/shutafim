import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { flash } from './flash'
import { askConfirm } from './confirm'
import Icon from './Icon'

// תפריט שלוש נקודות לפוסט שלי: עריכה, בקשות, ארכיון, מחיקה
export default function PostMenu({ post, onChanged, afterDelete }) {
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close)
  }, [])
  const archived = post.status !== 'active'
  const stop = e => { e.preventDefault(); e.stopPropagation() }
  const run = fn => async e => { stop(e); setOpen(false); await fn() }
  return (
    <div className="pmenu" ref={ref} onClick={stop}>
      <button className="pmdots" aria-label="אפשרויות הפוסט" aria-expanded={open} onClick={e => { stop(e); setOpen(o => !o) }}><Icon n="dots" size={18} /></button>
      {open && (
        <div className="pdrop">
          <button onClick={run(() => nav(`/post/${post.id}/edit`))}><Icon n="pencil" size={15} /> עריכת הפוסט</button>
          <button onClick={run(() => nav(`/inbox?tab=incoming&post=${post.id}`))}><Icon n="users" size={15} /> בקשות לדירה</button>
          <button onClick={run(async () => { await api.setStatus(post.id, archived ? 'active' : 'taken'); flash(archived ? 'הפוסט פעיל שוב' : 'הפוסט הועבר לארכיון'); onChanged?.() })}>
            <Icon n={archived ? 'plus' : 'minus'} size={15} /> {archived ? 'הפעלה מחדש' : 'העברה לארכיון'}</button>
          <button className="danger" onClick={run(async () => { if (await askConfirm({ title: 'למחוק את הפוסט?', text: 'הפוסט, הבקשות והשיחות שקשורים אליו יימחקו לצמיתות ואי אפשר לשחזר. אם הדירה פשוט נתפסה, עדיף להעביר אותה לארכיון.', confirmLabel: 'מחיקה', danger: true })) { await api.deletePost(post.id); flash('הפוסט נמחק', 'no'); afterDelete ? afterDelete() : onChanged?.() } })}><Icon n="x" size={15} /> מחיקה</button>
        </div>
      )}
    </div>
  )
}
