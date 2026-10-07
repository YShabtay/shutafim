import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useChatDock } from '../components/ChatDock'
import ProfileCard from '../components/ProfileCard'
import Icon from '../components/Icon'
import { SafetyMenu } from '../components/safety'
import { decide as decideApp, STATUS } from '../components/decide'
import { matchScore, profileToFilter } from '../match'


const ORDER = { pending: 0, chatting: 1, accepted: 2, declined: 3, withdrawn: 4 }
// מרכז אחד: בקשות שהגיעו אליי מכל הדירות, בקשות ששלחתי, ושיחות
export default function Inbox() {
  const { openChat } = useChatDock()
  const [q, setQ] = useSearchParams()
  const [incoming, setIncoming] = useState(null)
  const [sent, setSent] = useState([])
  const [convs, setConvs] = useState([])
  const load = () => Promise.all([api.listAllIncoming(), api.listMyApplications(), api.listConversations()])
    .then(([i, s, c]) => { setIncoming(i); setSent(s); setConvs(c) })
  useEffect(() => { load(); const t = setInterval(load, 3000); return () => clearInterval(t) }, [])

  const focusPost = q.get('post')
  const pending = (incoming || []).filter(a => a.status === 'pending').length
  const tab = q.get('tab') || (pending || !(sent.length || convs.length) ? 'incoming' : sent.length ? 'sent' : 'chats')
  const list = useMemo(() => (incoming || [])
    .map(a => ({ ...a, score: a.post && a.profile ? matchScore(a.post, profileToFilter(a.profile)) : null }))
    .sort((a, b) => ORDER[a.status] - ORDER[b.status] || (b.score ?? 0) - (a.score ?? 0)), [incoming])

  const decide = (a, status) => decideApp(a, status, { openChat, reload: load })
  if (incoming === null) return <div className="skel tall" />

  return (
    <div className="narrow wide inbox">
      <h2>בקשות והודעות</h2>
      <div className="tabs2 three" role="tablist">
        <button role="tab" aria-selected={tab === 'incoming'} className={tab === 'incoming' ? 'on' : ''} onClick={() => setQ({ tab: 'incoming' })}>בקשות אליי{pending > 0 && <i className="cnt">{pending}</i>}</button>
        <button role="tab" aria-selected={tab === 'sent'} className={tab === 'sent' ? 'on' : ''} onClick={() => setQ({ tab: 'sent' })}>הבקשות שלי</button>
        <button role="tab" aria-selected={tab === 'chats'} className={tab === 'chats' ? 'on' : ''} onClick={() => setQ({ tab: 'chats' })}>שיחות</button>
      </div>

      {tab === 'incoming' && <>
        {list.length === 0 && <p className="empty">עדיין לא הגיעו בקשות. כשמישהו יגיש בקשה לאחת הדירות שלך, הוא יופיע כאן עם הפרופיל שלו. <br /><Link to="/new">פרסמו דירה</Link></p>}
        {list.map(a => (
          <div key={a.id} className={'card appcard' + (focusPost && a.post_id === focusPost ? ' focus' : '')} ref={el => { if (el && focusPost && a.post_id === focusPost && !el.dataset.seen) { el.dataset.seen = '1'; el.scrollIntoView({ block: 'center' }) } }}>
            <div className="appcard-top">
              <Link to={`/post/${a.post_id}`} className="forpost">לדירה: {a.post?.title}</Link>
              {(a.status === 'pending' || a.status === 'chatting') && a.score != null ? <span className={'match ' + (a.score >= 80 ? 'hi' : a.score >= 50 ? 'mid' : 'lo')}><i />{a.score}% התאמה</span>
                : <span className={'tag ' + a.status}>{STATUS[a.status]}</span>}
              <SafetyMenu userId={a.applicant_id} name={a.profile?.first_name || 'המבקש/ת'} target={{ type: 'profile', id: a.applicant_id, what: 'המשתמש', label: 'דיווח על המשתמש' }} onChange={load} />
            </div>
            <ProfileCard profile={a.profile} />
            {a.message && <blockquote className="msg">{a.message}</blockquote>}
            <div className="actions">
              {a.status === 'pending' && <>
                <button className="btn primary" onClick={() => decide(a, 'chatting')}><Icon n="chat" size={16} /> שיחה</button>
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
      </>}

      {tab === 'sent' && <div className="card">
        {sent.length === 0 && <p className="meta">עוד לא הגשתם בקשות. מצאו דירה ולחצו "הגשת בקשה".</p>}
        {sent.map(a => (
          <div key={a.id} className="row">
            <Link to={`/post/${a.post_id}`}>{a.title}</Link>
            <span className={'tag ' + a.status}>{STATUS[a.status]}</span>
            {(a.status === 'accepted' || a.status === 'chatting') && a.conversation_id && <button className="btn soft" onClick={() => openChat(a.conversation_id)}>לצ'אט</button>}
          </div>
        ))}
      </div>}

      {tab === 'chats' && <div className="card">
        {convs.length === 0 && <p className="meta">שיחה נפתחת אחרי שבקשה אושרה.</p>}
        {convs.map(c => (
          <div key={c.id} className="row">
            <button className="linkbtn plain" onClick={() => openChat(c.id)}>{c.title}</button>
            <span className="tag">{c.role === 'owner' ? 'מתעניין/ת בדירה שלך' : 'בעל/ת הדירה'}</span>
          </div>
        ))}
      </div>}
    </div>
  )
}
