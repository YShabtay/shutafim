import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useChatDock } from './ChatDock'
import { NotifIcon, ago, notifText, useOpenNotification } from './notifications'
import { decide } from './decide'
import Avatar from './Avatar'

// תוכן ההתראות: בקשות חדשות (שיחה/דחייה), בקשות בשיחה (אישור סופי/דחייה) ועדכונים. משמש גם בתפריט במחשב וגם בעמוד בנייד.
export default function NotifPanel({ notifs, onDone = () => {} }) {
  const { openChat } = useChatDock()
  const [busy, setBusy] = useState(null)
  const go = useOpenNotification(notifs.reload)
  const reqs = notifs.requests, talks = notifs.inTalks
  const updates = notifs.list.filter(n => n.kind === 'accepted' || n.kind === 'declined' || n.kind === 'chatting')

  const act = async (a, status) => {
    setBusy(a.id)
    try { const conv = await decide(a, status, { openChat, reload: notifs.reload }); if (conv && status === 'chatting') onDone() } finally { setBusy(null) }
  }
  const Row = ({ a, talking }) => (
    <div className={'reqrow' + (talking ? ' talking' : '')}>
      <div className="reqtop">
        <Avatar profile={a.profile || { first_name: '?' }} size={38} />
        <div className="belltext">
          <span><b>{a.profile?.first_name || 'מישהו'}{a.profile?.age ? `, ${a.profile.age}` : ''}</b> {talking ? 'בשיחה איתך' : 'מבקש/ת להצטרף'}</span>
          <small>{a.post?.title}</small>
        </div>
      </div>
      {!talking && a.message && <p className="reqmsg">{a.message}</p>}
      <div className="reqbtns">
        {talking ? <>
          <button className="btn soft" disabled={busy === a.id} onClick={() => { onDone(); openChat(a.conversation_id) }}>לצ'אט</button>
          <button className="btn primary" disabled={busy === a.id} onClick={() => act(a, 'accepted')}>אישור כניסה</button>
        </> : <button className="btn primary" disabled={busy === a.id} onClick={() => act(a, 'chatting')}>שיחה</button>}
        <button className="btn ghost" disabled={busy === a.id} onClick={() => act(a, 'declined')}>דחייה</button>
        <Link className="reqlink" to={`/inbox?tab=incoming&post=${a.post_id}`} onClick={onDone}>פרופיל מלא</Link>
      </div>
    </div>
  )
  const empty = reqs.length === 0 && talks.length === 0 && updates.length === 0
  return (
    <>
      {empty && <p className="meta bellempty">אין התראות עדיין. כשתגיע בקשה לדירה שלך, תוכלו לפתוח שיחה עם המבקש מכאן.</p>}
      <div className="belllist">
        {reqs.length > 0 && <div className="bellsec">בקשות חדשות ({reqs.length})</div>}
        {reqs.map(a => <Row key={a.id} a={a} />)}
        {talks.length > 0 && <div className="bellsec">בשיחה, ממתינות להחלטה ({talks.length})</div>}
        {talks.map(a => <Row key={a.id} a={a} talking />)}
        {updates.length > 0 && <div className="bellsec">עדכונים</div>}
        {updates.map(n => (
          <button key={n.id} className={'bellitem' + (n.read ? '' : ' unread')} onClick={() => { onDone(); go(n) }}>
            <NotifIcon kind={n.kind} />
            <span className="belltext"><span>{notifText(n)}</span><small>{ago(n.created_at)}</small></span>
            {!n.read && <i className="udot2" />}
          </button>
        ))}
      </div>
    </>
  )
}
