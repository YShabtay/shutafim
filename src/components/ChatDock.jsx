import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { api } from '../api'
import Avatar from './Avatar'
import Icon from './Icon'

const Ctx = createContext({ openChat: () => {}, isOpen: () => false })
export const useChatDock = () => useContext(Ctx)

// חלונות צ'אט קטנים בפינה, כמו במסנג'ר: עד 3 שיחות פתוחות, אפשר למזער ולסגור
export function ChatDockProvider({ children }) {
  const [wins, setWins] = useState([]) // { id, min }
  const openChat = id => setWins(w => (w.some(x => x.id === id) ? w.map(x => (x.id === id ? { ...x, min: false } : x)) : [...w.slice(-2), { id, min: false }]))
  const close = id => setWins(w => w.filter(x => x.id !== id))
  const toggle = id => setWins(w => w.map(x => (x.id === id ? { ...x, min: !x.min } : x)))
  const isOpen = id => wins.some(x => x.id === id && !x.min)
  return (
    <Ctx.Provider value={{ openChat, isOpen }}>
      {children}
      <div className="dock">{wins.map(w => <ChatWindow key={w.id} cid={w.id} min={w.min} onClose={() => close(w.id)} onToggle={() => toggle(w.id)} />)}</div>
    </Ctx.Provider>
  )
}

function ChatWindow({ cid, min, onClose, onToggle }) {
  const [me, setMe] = useState(null)
  const [conv, setConv] = useState(undefined)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const end = useRef()
  useEffect(() => {
    api.getUser().then(setMe)
    api.getConversation(cid).then(setConv)
    api.listMessages(cid).then(setMsgs)
    api.markConversationRead(cid)
    return api.subscribe(cid, m => { setMsgs(m); api.markConversationRead(cid) })
  }, [cid])
  useEffect(() => { if (!min) end.current?.scrollIntoView({ block: 'end' }) }, [msgs, min])

  const send = async e => {
    e.preventDefault()
    const body = text.trim(); if (!body) return
    setText(''); setErr('')
    try { await api.sendMessage(cid, body); setMsgs(await api.listMessages(cid)) } catch (x) { setErr(x.message); setText(body) }
  }
  const name = conv?.other ? conv.other.first_name : conv?.title || '…'
  return (
    <section className={'cwin' + (min ? ' min' : '')} aria-label={'צ\'אט עם ' + name}>
      <header onClick={onToggle}>
        {conv?.other && <Avatar profile={conv.other} size={30} />}
        <div className="cwin-title"><b>{name}</b>{conv?.title && <small>{conv.title}</small>}</div>
        <button aria-label={min ? 'הרחב' : 'מזער'} onClick={e => { e.stopPropagation(); onToggle() }}><Icon n="minus" size={16} /></button>
        <button aria-label="סגור" onClick={e => { e.stopPropagation(); onClose() }}><Icon n="x" size={16} /></button>
      </header>
      {!min && <>
        <div className="cwin-msgs">
          {conv === null && <p className="meta">השיחה לא נמצאה.</p>}
          {conv && msgs.length === 0 && <p className="meta">כתבו הודעה ראשונה.</p>}
          {msgs.map(m => <div key={m.id} className={'bubble ' + (m.sender_id === me?.id ? 'me' : 'them')}>{m.body}</div>)}
          <div ref={end} />
        </div>
        {err && <p className="err small">{err}</p>}
        <form className="cwin-send" onSubmit={send}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="כתבו הודעה…" maxLength={2000} />
          <button className="btn primary" aria-label="שלח"><Icon n="arrow" size={16} className="flip" /></button>
        </form>
      </>}
    </section>
  )
}
