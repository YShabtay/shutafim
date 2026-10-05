import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
export default function MyPosts() {
  const [list, setList] = useState(null)
  const load = () => api.myPosts().then(setList)
  useEffect(() => { load() }, [])
  if (!list) return <p>טוען…</p>
  return (
    <div className="card narrow">
      <h2>הפוסטים שלי</h2>
      {list.length === 0 && <p>עדיין לא פרסמתם. <Link to="/new">פרסמו דירה</Link></p>}
      {list.map(p => (
        <div key={p.id} className="row">
          <Link to={`/post/${p.id}`}>{p.title}</Link>
          <Link className={'btn soft' + (p.pending ? ' hot' : '')} to={`/post/${p.id}/requests`}>בקשות{p.pending ? ` (${p.pending})` : ''}</Link>
          <span className={'tag ' + p.status}>{p.status === 'active' ? 'פעיל' : 'נתפס'}</span>
          <button className="btn ghost" onClick={async () => { await api.setStatus(p.id, p.status === 'active' ? 'taken' : 'active'); load() }}>
            {p.status === 'active' ? 'מצאתי שותף ✓' : 'הפעל מחדש'}</button>
          <button className="btn ghost" onClick={async () => { if (confirm('למחוק את הפוסט?')) { await api.deletePost(p.id); load() } }}>מחיקה</button>
        </div>
      ))}
    </div>
  )
}
