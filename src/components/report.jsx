import { useEffect, useState } from 'react'

export const REASONS = [
  ['fake', 'פרסום או פרופיל מזויפים או מטעים'],
  ['scam', 'ניסיון הונאה או בקשה להעביר כסף'],
  ['harassment', 'הטרדה או שפה פוגענית'],
  ['inappropriate', 'תוכן או תמונה לא הולמים'],
  ['other', 'אחר'],
]

// חלון דיווח מתוך האתר. מחזיר { reason, details } או null אם ביטלו.
export const askReport = opts => new Promise(resolve => window.dispatchEvent(new CustomEvent('shutafim:report', { detail: { ...opts, resolve } })))

export function ReportHost() {
  const [item, setItem] = useState(null)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  useEffect(() => {
    const open = e => { setItem(e.detail); setReason(''); setDetails('') }
    window.addEventListener('shutafim:report', open)
    return () => window.removeEventListener('shutafim:report', open)
  }, [])
  useEffect(() => {
    if (!item) return
    const key = e => { if (e.key === 'Escape') close(null) }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [item])
  const close = v => { item.resolve(v); setItem(null) }
  if (!item) return null
  return (
    <div className="modalback" onMouseDown={e => { if (e.target === e.currentTarget) close(null) }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="rep-title">
        <h3 id="rep-title">{item.title || 'דיווח'}</h3>
        <p>מה הבעיה? הדיווח נשמר באופן פרטי ויטופל על ידי בעל האתר. המשתמש המדווח לא יידע.</p>
        <div className="reasons" role="radiogroup">
          {REASONS.map(([k, label]) => (
            <label key={k} className={'reason' + (reason === k ? ' on' : '')}>
              <input type="radio" name="reason" checked={reason === k} onChange={() => setReason(k)} /> {label}
            </label>
          ))}
        </div>
        <textarea rows="3" maxLength={1000} placeholder="פרטים נוספים (אופציונלי)" value={details} onChange={e => setDetails(e.target.value)} />
        <div className="modalbtns">
          <button className="btn ghost" onClick={() => close(null)}>ביטול</button>
          <button className="btn danger" disabled={!reason} onClick={() => close({ reason, details: details.trim() })}>שליחת דיווח</button>
        </div>
      </div>
    </div>
  )
}
