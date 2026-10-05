import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import ProfileCard from '../components/ProfileCard'
import Icon from '../components/Icon'
import { useChatDock } from '../components/ChatDock'
import { decide as decideApp, STATUS } from '../components/decide'
import { matchScore, profileToFilter } from '../match'


const ORDER = { pending: 0, chatting: 1, accepted: 2, declined: 3, withdrawn: 4 }
export default function Requests() {
  const { id } = useParams()
  const [post, setPost] = useState(undefined)
  const [apps, setApps] = useState(null)
  const { openChat } = useChatDock()
  const load = () => api.listIncoming(id).then(setApps)
  useEffect(() => { api.getPost(id).then(setPost); load() }, [id])

  const list = useMemo(() => (apps || [])
    .map(a => ({ ...a, score: post && a.profile ? matchScore(post, profileToFilter(a.profile)) : null }))
    .sort((a, b) => ORDER[a.status] - ORDER[b.status] || (b.score ?? 0) - (a.score ?? 0)), [apps, post])

  const decide = (a, status) => decideApp(a, status, { openChat, reload: load })
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
              <button className="btn primary" onClick={() => decide(a, 'chatting')}>שיחה</button>
              <button className="btn ghost" onClick={() => decide(a, 'declined')}>דחייה</button>
            </>}
            {a.status === 'chatting' && <>
              <button className="btn soft" onClick={() => openChat(a.conversation_id)}><Icon n="chat" size={16} /> לצ'אט</button>
              <button className="btn primary" onClick={() => decide(a, 'accepted')}>אישור כניסה לדירה</button>
              <button className="btn ghost" onClick={() => decide(a, 'declined')}>דחייה</button>
            </>}
            {a.status === 'accepted' && a.conversation_id && <button className="btn soft" onClick={() => openChat(a.conversation_id)}><Icon n="chat" size={16} /> לצ'אט</button>}
          </div>
        </div>
      ))}
    </div>
  )
}
