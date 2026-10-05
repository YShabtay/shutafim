import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import ProfileCard from '../components/ProfileCard'
import Icon from '../components/Icon'
import { useChatDock } from '../components/ChatDock'
import { matchScore, profileToFilter } from '../match'

const STATUS = { pending: 'ממתינה', accepted: 'אושרה', declined: 'נדחתה', withdrawn: 'בוטלה' }

export default function Requests() {
  const { id } = useParams()
  const [post, setPost] = useState(undefined)
  const [apps, setApps] = useState(null)
  const { openChat } = useChatDock()
  const load = () => api.listIncoming(id).then(setApps)
  useEffect(() => { api.getPost(id).then(setPost); load() }, [id])

  const list = useMemo(() => (apps || [])
    .map(a => ({ ...a, score: post && a.profile ? matchScore(post, profileToFilter(a.profile)) : null }))
    .sort((a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1) || (b.score ?? 0) - (a.score ?? 0)), [apps, post])

  const decide = async (a, status) => {
    const conv = await api.setApplicationStatus(a.id, status)
    await load()
    if (status === 'accepted' && conv) openChat(conv.id)
  }

  if (post === undefined || apps === null) return <div className="skel tall" />
  return (
    <div className="narrow wide">
      <Link to="/mine" className="back"><Icon n="arrow" size={16} /> חזרה לפוסטים שלי</Link>
      <h2>בקשות לדירה</h2>
      <p className="meta">{post?.title}</p>
      {list.length === 0 && <p className="empty">עדיין אין בקשות. כשמישהו יגיש בקשה הוא יופיע כאן עם הפרופיל שלו.</p>}
      {list.map(a => (
        <div key={a.id} className="card appcard">
          <div className="appcard-top">
            {a.score != null && <span className={'match ' + (a.score >= 80 ? 'hi' : a.score >= 50 ? 'mid' : 'lo')}><i />{a.score}% התאמה</span>}
            {a.status !== 'pending' && <span className={'tag ' + a.status}>{STATUS[a.status]}</span>}
          </div>
          <ProfileCard profile={a.profile} />
          {a.message && <blockquote className="msg">{a.message}</blockquote>}
          <div className="actions">
            {a.status === 'pending' && <>
              <button className="btn primary" onClick={() => decide(a, 'accepted')}>אישור ופתיחת צ'אט</button>
              <button className="btn ghost" onClick={() => decide(a, 'declined')}>דחייה</button>
            </>}
            {a.status === 'accepted' && a.conversation_id && <button className="btn soft" onClick={() => openChat(a.conversation_id)}><Icon n="chat" size={16} /> לצ'אט</button>}
          </div>
        </div>
      ))}
    </div>
  )
}
