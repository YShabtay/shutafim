import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { REASONS } from '../components/report'
import { askConfirm } from '../components/confirm'
import { flash } from '../components/flash'

const REASON = Object.fromEntries(REASONS)
const KIND = { post: 'פוסט', profile: 'משתמש', chat: 'שיחה' }
const when = iso => new Date(iso).toLocaleString('he-IL', { dateStyle: 'medium', timeStyle: 'short' })
const nm = p => (p ? `${p.first_name}${p.age ? `, ${p.age}` : ''}${p.username ? ` (@${p.username})` : ''}` : 'משתמש לא ידוע')

// עמוד ניהול: דיווחים במילים פשוטות, עם כפתורי פעולה. רק למנהלים.
export default function Admin() {
  const [ok, setOk] = useState(undefined)
  const [rows, setRows] = useState(null)
  const [tab, setTab] = useState('open')
  const load = () => api.adminReports().then(setRows)
  useEffect(() => { api.isAdmin().then(a => { setOk(a); if (a) load() }) }, [])
  if (ok === undefined || (ok && rows === null)) return <div className="skel tall" />
  if (!ok) return <p className="empty">העמוד הזה זמין רק למנהלי האתר.</p>

  const open = rows.filter(r => r.status === 'open'), done = rows.filter(r => r.status !== 'open')
  const list = tab === 'open' ? open : done
  const mark = async (r, status) => { await api.adminSetReportStatus(r.id, status); flash(status === 'handled' ? 'סומן כטופל' : 'הוחזר לפתוחים'); load() }
  const archive = async r => { await api.setStatus(r.post.id, 'taken'); await api.adminSetReportStatus(r.id, 'handled'); flash('הפוסט הועבר לארכיון והדיווח סומן כטופל'); load() }
  const remove = async r => {
    if (!(await askConfirm({ title: 'למחוק את הפוסט?', text: `"${r.post.title}" יימחק לצמיתות יחד עם הבקשות והשיחות שלו.`, confirmLabel: 'מחיקה', danger: true }))) return
    await api.deletePost(r.post.id); await api.adminSetReportStatus(r.id, 'handled'); flash('הפוסט נמחק והדיווח סומן כטופל', 'no'); load()
  }

  return (
    <div className="narrow wide">
      <h2>דיווחים</h2>
      <p className="meta">כאן רואים מה משתמשים דיווחו עליו. עוברים על כל דיווח, מחליטים מה לעשות, ומסמנים כטופל.</p>
      <div className="tabs2" role="tablist">
        <button role="tab" aria-selected={tab === 'open'} className={tab === 'open' ? 'on' : ''} onClick={() => setTab('open')}>ממתינים לטיפול{open.length > 0 && <i className="cnt">{open.length}</i>}</button>
        <button role="tab" aria-selected={tab === 'done'} className={tab === 'done' ? 'on' : ''} onClick={() => setTab('done')}>טופלו ({done.length})</button>
      </div>
      {list.length === 0 && <p className="empty">{tab === 'open' ? 'אין דיווחים שממתינים. הכול טופל 🎉' : 'עדיין לא טופל דבר.'}</p>}
      {list.map(r => (
        <div key={r.id} className="card repcard">
          <div className="reptop">
            <span className="tag">דיווח על {KIND[r.target_type]}</span>
            <b className="reason-badge">{REASON[r.reason] || r.reason}</b>
            <small>{when(r.created_at)}</small>
          </div>
          <p className="repwhat">
            {r.target_type === 'post' && (r.post ? <>הפוסט <Link to={`/post/${r.post.id}`}>"{r.post.title}"</Link> ({r.post.city}, ₪{r.post.rent.toLocaleString()}){r.post.status !== 'active' ? ' · כרגע בארכיון' : ''}</> : 'הפוסט כבר נמחק')}
            {r.target_type === 'profile' && <>המשתמש <b>{nm(r.target)}</b></>}
            {r.target_type === 'chat' && <>שיחה עם <b>{nm(r.target)}</b></>}
          </p>
          {r.details && <blockquote className="msg">{r.details}</blockquote>}
          <p className="meta">דווח על ידי {nm(r.reporter)}{r.againstSameUser > 1 && <> · <b className="warn">יש {r.againstSameUser} דיווחים על אותו משתמש</b></>}</p>
          <div className="actions">
            {r.status === 'open' ? <>
              {r.target_type === 'post' && r.post && <>
                <button className="btn ghost" onClick={() => archive(r)}>העברה לארכיון</button>
                <button className="btn danger" onClick={() => remove(r)}>מחיקת הפוסט</button>
              </>}
              <button className="btn primary" onClick={() => mark(r, 'handled')}>סימון כטופל</button>
            </> : <button className="btn soft" onClick={() => mark(r, 'open')}>החזרה לממתינים</button>}
          </div>
          {r.target_type !== 'post' && r.status === 'open' && <p className="meta small">להסרת משתמש מהאתר: Supabase ← Authentication ← Users.</p>}
        </div>
      ))}
    </div>
  )
}
