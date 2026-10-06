import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { flash } from '../components/flash'

// הפוסטים שלי: פעילים וארכיון. דירה עוברת לארכיון אוטומטית כשמאשרים שותף/ה, או ידנית.
export default function MyPosts() {
  const [list, setList] = useState(null)
  const [tab, setTab] = useState('active')
  const load = () => api.myPosts().then(setList)
  useEffect(() => { load() }, [])
  if (!list) return <div className="skel tall" />
  const active = list.filter(p => p.status === 'active')
  const archive = list.filter(p => p.status !== 'active')
  const shown = tab === 'active' ? active : archive

  return (
    <div className="narrow wide">
      <h2>הפוסטים שלי</h2>
      <div className="tabs2" role="tablist">
        <button role="tab" aria-selected={tab === 'active'} className={tab === 'active' ? 'on' : ''} onClick={() => setTab('active')}>פעילים ({active.length})</button>
        <button role="tab" aria-selected={tab === 'archive'} className={tab === 'archive' ? 'on' : ''} onClick={() => setTab('archive')}>ארכיון ({archive.length})</button>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        {shown.length === 0 && (tab === 'active'
          ? <p className="meta">אין פוסטים פעילים. <Link to="/new">פרסמו דירה</Link></p>
          : <p className="meta">הארכיון ריק. דירה עוברת לכאן כשמאשרים שותף/ה, או כשמעבירים אותה ידנית.</p>)}
        {shown.map(p => (
          <div key={p.id} className="row">
            <Link to={`/post/${p.id}`}>{p.title}</Link>
            <Link className={'btn soft' + (p.pending ? ' hot' : '')} to={`/post/${p.id}/requests`}>בקשות{p.pending ? ` (${p.pending})` : ''}</Link>
            {tab === 'active'
              ? <button className="btn ghost" onClick={async () => { await api.setStatus(p.id, 'taken'); flash('הפוסט הועבר לארכיון'); load() }}>העברה לארכיון</button>
              : <button className="btn ghost" onClick={async () => { await api.setStatus(p.id, 'active'); flash('הפוסט פעיל שוב'); load() }}>הפעלה מחדש</button>}
            <button className="btn ghost" onClick={async () => { if (confirm('למחוק את הפוסט לצמיתות?')) { await api.deletePost(p.id); load() } }}>מחיקה</button>
          </div>
        ))}
      </div>
    </div>
  )
}
