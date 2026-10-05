import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

const STATUS = { pending: 'ממתינה', accepted: 'אושרה', declined: 'נדחתה', withdrawn: 'בוטלה' }

export default function Inbox() {
  const [convs, setConvs] = useState(null)
  const [apps, setApps] = useState([])
  useEffect(() => {
    api.listConversations().then(setConvs)
    api.listMyApplications().then(setApps)
    const t = setInterval(() => api.listMyApplications().then(setApps), 2500)
    return () => clearInterval(t)
  }, [])
  if (!convs) return <p>טוען…</p>
  return (
    <div className="card narrow">
      <h2>הודעות</h2>
      <h3 className="sub-h">שיחות</h3>
      {convs.length === 0 && <p className="meta">שיחה נפתחת אחרי שבקשה אושרה.</p>}
      {convs.map(c => (
        <div key={c.id} className="row">
          <Link to={`/chat/${c.id}`}>{c.title}</Link>
          <span className="tag">{c.role === 'owner' ? 'מתעניין/ת בדירה שלך' : 'בעל/ת הדירה'}</span>
        </div>
      ))}
      <h3 className="sub-h">הבקשות שלי</h3>
      {apps.length === 0 && <p className="meta">עוד לא הגשתם בקשות. מצאו דירה ולחצו "הגשת בקשה".</p>}
      {apps.map(a => (
        <div key={a.id} className="row">
          <Link to={`/post/${a.post_id}`}>{a.title}</Link>
          <span className={'tag ' + a.status}>{STATUS[a.status]}</span>
          {a.status === 'accepted' && a.conversation_id && <Link className="btn soft" to={`/chat/${a.conversation_id}`}>לצ'אט</Link>}
        </div>
      ))}
    </div>
  )
}
