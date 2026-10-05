import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import Avatar from '../components/Avatar'
export default function Chat({ user }) {
  const { id } = useParams()
  const [conv, setConv] = useState(undefined)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const end = useRef()
  useEffect(() => {
    api.getConversation(id).then(setConv)
    api.listMessages(id).then(setMsgs)
    return api.subscribe(id, setMsgs)
  }, [id])
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [msgs])
  const send = async e => {
    e.preventDefault()
    const body = text.trim(); if (!body) return
    setText('')
    try { await api.sendMessage(id, body); setMsgs(await api.listMessages(id)) } catch (x) { setErr(x.message); setText(body) }
  }
  if (conv === undefined) return <p>טוען…</p>
  if (!conv) return <p className="empty">השיחה לא נמצאה.</p>
  return (
    <div className="card narrow chat">
      <Link to="/inbox">← הודעות</Link>
      <div className="chathead">{conv.other && <Avatar profile={conv.other} size={44} />}
        <div><b>{conv.other ? `${conv.other.first_name}, ${conv.other.age}` : conv.title}</b><div className="meta">{conv.title}</div></div></div>
      <p className="meta">{conv.role === 'owner' ? 'שיחה עם מתעניין/ת' : 'שיחה עם בעל/ת הדירה'} · <Link to={`/post/${conv.post_id}`}>לפוסט</Link></p>
      <div className="msgs">
        {msgs.length === 0 && <p className="meta">כתבו הודעה ראשונה, למשל הציגו את עצמכם בקצרה.</p>}
        {msgs.map(m => <div key={m.id} className={'bubble ' + (m.sender_id === user.id ? 'me' : 'them')}>{m.body}</div>)}
        <div ref={end} />
      </div>
      {err && <p className="err">{err}</p>}
      <form className="send" onSubmit={send}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="כתבו הודעה…" maxLength={2000} />
        <button className="btn primary">שלח</button>
      </form>
    </div>
  )
}
