import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import Avatar from './Avatar'
import Icon from './Icon'
import { getSeen, markSeen, markUnread } from '../seen'
import { decide } from './decide'
import { reportThing, toggleBlock } from './safety'

const Ctx = createContext({ openChat: () => {}, isOpen: () => false, notifyIncoming: () => false })
export const useChatDock = () => useContext(Ctx)

// חלונות צ'אט קטנים בפינה, כמו במסנג'ר: עד 3 שיחות פתוחות, אפשר למזער ולסגור
export function ChatDockProvider({ children }) {
  const [wins, setWins] = useState([]) // { id, min }
  const nav = useNavigate()
  const loc = useLocation()
  const isMobile = () => window.matchMedia('(max-width: 640px)').matches
  // גם בנייד השיחה נפתחת כחלון: למעלה מסך שיחה, וכשממזערים נשארת בועה קטנה מעל הסרגל התחתון ואפשר להמשיך לגלול באתר
  const openChat = id => setWins(w => (w.some(x => x.id === id) ? w.map(x => (x.id === id ? { ...x, min: false } : x)) : [...w.slice(-2), { id, min: false }]))
  // הודעה חדשה במחשב: קופץ למטה חלון ממוזער וממתין שיפתחו אותו (כמו בפייסבוק). בנייד מחזיר false והאתר מציג בועה במקום.
  const notifyIncoming = id => {
    if (isMobile()) return false
    setWins(w => (w.some(x => x.id === id) ? w : [...w.slice(-2), { id, min: true }]))
    return true
  }
  const close = id => setWins(w => w.filter(x => x.id !== id))
  // בנייד מזעור הוא חזרה לאייקון ההודעות: החלון מתכווץ לשם והשיחה נמצאת ברשימת ההודעות
  const toggle = id => {
    if (isMobile()) {
      setWins(w => w.map(x => (x.id === id ? { ...x, closing: true } : x)))
      setTimeout(async () => {
        close(id)
        // ההודעה האחרונה מהצד השני ועוד לא נענתה: נשארת התראה על אייקון ההודעות. אם עניתי, אין התראה.
        try {
          const [me, list] = await Promise.all([api.getUser(), api.listMessages(id)])
          const last = list[list.length - 1]
          if (me && last && last.sender_id !== me.id) markUnread(me.id, id, list[list.length - 2]?.created_at)
        } catch {}
      }, 260)
      return
    }
    setWins(w => w.map(x => (x.id === id ? { ...x, min: !x.min } : x)))
  }
  // המקלדת בנייד מכווצת רק את אזור התצוגה, כך שהחלון נשאר מעליה ושדה ההקלדה לא נחסם
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const h = () => document.documentElement.style.setProperty('--kb', Math.max(0, window.innerHeight - vv.height - vv.offsetTop) + 'px')
    vv.addEventListener('resize', h); vv.addEventListener('scroll', h); h()
    return () => { vv.removeEventListener('resize', h); vv.removeEventListener('scroll', h) }
  }, [])
  const openWin = wins.find(x => !x.min)
  const isOpen = id => wins.some(x => x.id === id && !x.min) || loc.pathname === `/chat/${id}`
  return (
    <Ctx.Provider value={{ openChat, isOpen, notifyIncoming }}>
      {children}
      {openWin && !openWin.closing && <div className="dockback" onClick={() => toggle(openWin.id)} />}
      <div className={'dock' + (openWin ? ' open' : '')}>{wins.map(w => <ChatWindow key={w.id} cid={w.id} min={w.min} closing={w.closing} onClose={() => close(w.id)} onToggle={() => toggle(w.id)} />)}</div>
    </Ctx.Provider>
  )
}

export function ChatWindow({ cid, min, closing, onClose, onToggle, page = false }) {
  const [me, setMe] = useState(null)
  const [conv, setConv] = useState(undefined)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const [tools, setTools] = useState(false) // פס דיווח וחסימה
  const end = useRef()
  const [, bump] = useState(0)
  useEffect(() => { const h = () => bump(n => n + 1); window.addEventListener('shutafim:seen', h); return () => window.removeEventListener('shutafim:seen', h) }, [])
  const last = msgs[msgs.length - 1]
  const unread = !!(min && last && me && last.sender_id !== me.id && last.created_at > (getSeen(me.id)[cid] || ''))
  useEffect(() => {
    api.getUser().then(setMe)
    api.getConversation(cid).then(setConv)
    api.listMessages(cid).then(setMsgs)
    api.markConversationRead(cid)
    return api.subscribe(cid, m => { setMsgs(m); api.markConversationRead(cid); api.getConversation(cid).then(setConv) })
  }, [cid])
  const act = async status => {
    const other = conv.other
    await decide({ id: conv.application.id, profile: other }, status, { reload: async () => setConv(await api.getConversation(cid)) })
    setMsgs(await api.listMessages(cid))
  }
  useEffect(() => { if (!min) end.current?.scrollIntoView({ block: 'end' }) }, [msgs, min])
  useEffect(() => { // שיחה פתוחה ולא ממוזערת: ההודעות נקראו
    const last = msgs[msgs.length - 1]
    if (!min && me && last) markSeen(me.id, cid, last.created_at)
  }, [msgs, min, me])

  const send = async e => {
    e.preventDefault()
    const body = text.trim(); if (!body) return
    setText(''); setErr('')
    try { await api.sendMessage(cid, body); setMsgs(await api.listMessages(cid)) }
    catch (x) { setErr(/row-level|violates|blocked/i.test(x.message) ? 'לא ניתן לשלוח הודעות בשיחה הזו' : x.message); setText(body) }
  }
  const name = conv?.other ? conv.other.first_name : conv?.title || '…'
  const otherId = conv?.other?.user_id
  const refreshConv = async () => setConv(await api.getConversation(cid))
  return (
    <section className={'cwin' + (min ? ' min' : '') + (unread ? ' unread' : '') + (page ? ' page' : '') + (closing ? ' closing' : '')} aria-label={'צ\'אט עם ' + name}>
      <header onClick={page ? undefined : onToggle}>
        {page && <button aria-label="חזרה" onClick={e => { e.stopPropagation(); onClose() }}><Icon n="arrow" size={16} /></button>}
        {conv?.other && <Avatar profile={conv.other} size={30} />}
        <div className="cwin-title"><b>{name}</b>{(unread ? last?.body : conv?.title) && <small>{unread ? last.body : conv.title}</small>}</div>
        {unread && <i className="cwin-dot" aria-label="הודעה חדשה" />}
        {otherId && !min && <button aria-label="דיווח וחסימה" aria-expanded={tools} onClick={e => { e.stopPropagation(); setTools(t => !t) }}><Icon n="dots" size={16} /></button>}
        {!page && <button aria-label={min ? 'הרחב' : 'מזער'} onClick={e => { e.stopPropagation(); onToggle() }}><Icon n="minus" size={16} /></button>}
        {!page && <button aria-label="סגור" onClick={e => { e.stopPropagation(); onClose() }}><Icon n="x" size={16} /></button>}
      </header>
      {!min && <>
        {tools && otherId && (
          <div className="safetystrip">
            <button onClick={() => { setTools(false); reportThing({ type: 'chat', id: cid, userId: otherId, what: `השיחה עם ${name}` }) }}><Icon n="shield" size={14} /> דיווח על השיחה</button>
            <button className={conv?.blockedByMe ? '' : 'danger'} onClick={async () => { setTools(false); await toggleBlock(otherId, name, !!conv?.blockedByMe); refreshConv() }}>
              <Icon n="x" size={14} /> {conv?.blockedByMe ? 'ביטול חסימה' : `חסימת ${name}`}</button>
          </div>
        )}
        <div className="cwin-msgs">
          {conv === null && <p className="meta">השיחה לא נמצאה.</p>}
          {conv && (() => { const st = conv.application?.status
            return st === 'accepted' ? <div className="sysmsg ok"><Icon n="shield" size={14} /> אושר/ה כשותף/ה לדירה "{conv.title}"</div>
              : st === 'declined' ? <div className="sysmsg no">הבקשה נדחתה</div>
              : <div className="sysmsg info">שלב היכרות לגבי "{conv.title}". ההחלטה הסופית עוד לא התקבלה</div> })()}
          {conv?.role === 'owner' && conv.application?.status === 'chatting' && (
            <div className="decidebar">
              <button className="btn primary" onClick={() => act('accepted')}>אישור כניסה לדירה</button>
              <button className="btn ghost" onClick={() => act('declined')}>דחייה</button>
            </div>)}
          {conv?.blockedByMe && <div className="sysmsg no">חסמת את {name}. לא ניתן לשלוח הודעות</div>}
          {msgs.map(m => <div key={m.id} className={'bubble ' + (m.sender_id === me?.id ? 'me' : 'them')}>{m.body}</div>)}
          <div ref={end} />
        </div>
        {err && <p className="err small">{err}</p>}
        <form className="cwin-send" onSubmit={send}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder={conv?.blockedByMe ? 'השיחה חסומה' : 'כתבו הודעה…'} disabled={!!conv?.blockedByMe} maxLength={2000} />
          <button className="btn primary" aria-label="שלח"><Icon n="arrow" size={16} className="flip" /></button>
        </form>
      </>}
    </section>
  )
}
