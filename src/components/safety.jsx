import { useEffect, useRef, useState } from 'react'
import { api, isGuest } from '../api'
import { askConfirm } from './confirm'
import { askReport } from './report'
import { flash } from './flash'
import Icon from './Icon'

// דיווח על פוסט / משתמש / שיחה
export async function reportThing({ type, id, userId, what }) {
  if (isGuest) return flash('צריך חשבון כדי לדווח', 'no')
  const r = await askReport({ title: `דיווח על ${what}` })
  if (!r) return false
  try { await api.report({ targetType: type, targetId: id, targetUserId: userId, reason: r.reason, details: r.details }); flash('תודה, הדיווח התקבל ויטופל') }
  catch { flash('לא הצלחנו לשלוח את הדיווח. נסו שוב', 'no'); return false }
  return true
}

// חסימה או ביטול חסימה. מחזיר את המצב החדש (true = חסום).
export async function toggleBlock(userId, name, blocked) {
  if (isGuest) { flash('צריך חשבון כדי לחסום', 'no'); return blocked }
  if (blocked) { await api.unblockUser(userId); flash('החסימה בוטלה'); return false }
  const ok = await askConfirm({ title: `לחסום את ${name}?`, text: 'הוא/היא לא יוכלו לשלוח לך בקשות או הודעות, והבקשות הפתוחות שלהם יידחו. אפשר לבטל את החסימה בכל זמן.', confirmLabel: 'חסימה', danger: true })
  if (!ok) return false
  await api.blockUser(userId); flash(`${name} נחסם/ה`, 'no')
  return true
}

// תפריט שלוש נקודות: דיווח וחסימה של משתמש
export function SafetyMenu({ userId, name = 'המשתמש', target, onChange }) {
  const [open, setOpen] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close)
  }, [])
  useEffect(() => { if (open && userId) api.listBlocks().then(l => setBlocked(l.includes(userId))).catch(() => {}) }, [open, userId])
  if (!userId || isGuest) return null
  return (
    <div className="pmenu" ref={ref}>
      <button className="pmdots" aria-label="דיווח וחסימה" aria-expanded={open} onClick={() => setOpen(o => !o)}><Icon n="dots" size={18} /></button>
      {open && (
        <div className="pdrop">
          <button onClick={() => { setOpen(false); reportThing({ type: target.type, id: target.id, userId, what: target.what }) }}><Icon n="shield" size={15} /> {target.label || 'דיווח'}</button>
          <button className={blocked ? '' : 'danger'} onClick={async () => { setOpen(false); const b = await toggleBlock(userId, name, blocked); setBlocked(b); onChange?.() }}>
            <Icon n="x" size={15} /> {blocked ? `ביטול חסימה של ${name}` : `חסימת ${name}`}</button>
        </div>
      )}
    </div>
  )
}
