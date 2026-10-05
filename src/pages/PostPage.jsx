import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { fmtDate, prefChips } from '../labels'
import Icon from '../components/Icon'
import Placeholder from '../components/Placeholder'
import ProfileCard from '../components/ProfileCard'
import { useChatDock } from '../components/ChatDock'
import { isComplete } from '../match'

const STATUS_TXT = { pending: 'הבקשה נשלחה וממתינה לתשובה של בעל הדירה.', declined: 'הבקשה לא אושרה הפעם. אפשר לחפש דירות נוספות.', withdrawn: 'הבקשה בוטלה.' }

export default function PostPage({ user, profile }) {
  const { id } = useParams()
  const { openChat } = useChatDock()
  const [p, setP] = useState(undefined)
  const [host, setHost] = useState(null)
  const [app, setApp] = useState(undefined)
  const [social, setSocial] = useState('')
  const [msg, setMsg] = useState('')
  const [big, setBig] = useState(0)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  useEffect(() => { api.getPost(id).then(setP) }, [id])
  useEffect(() => { if (p && user) api.getProfile(p.owner_id).then(setHost) }, [p, user])
  const loadApp = () => api.getMyApplication(id).then(setApp)
  useEffect(() => { if (user && p && p.owner_id !== user.id) loadApp() }, [user, p])
  useEffect(() => { if (app?.status === 'accepted') api.getSocial(id).then(s => setSocial(s || '')) }, [app?.status])
  // בדמו הבקשה מאושרת אוטומטית, אז נבדוק מחדש בזמן שהיא ממתינה
  useEffect(() => { if (app?.status !== 'pending') return; const t = setInterval(loadApp, 2000); return () => clearInterval(t) }, [app?.status])

  if (p === undefined) return <div className="skel tall" />
  if (!p) return <p className="empty">הפוסט לא נמצא או שהדירה כבר נתפסה.</p>
  const mine = user && p.owner_id === user.id
  const chips = prefChips(p)

  const send = async e => {
    e.preventDefault(); setBusy(true); setErr('')
    try { await api.apply(id, msg.trim()); await loadApp() } catch (x) { setErr(x.message) }
    setBusy(false)
  }

  const contactBox = () => {
    if (p.is_sample) return <><p className="meta"><b>זו דירה לדוגמה.</b> היא נוצרה כדי להמחיש איך האתר נראה, ואי אפשר להגיש לה בקשה.</p><Link className="btn primary big" to="/">חזרה לדירות</Link><Link className="btn soft big" to="/new">פרסמו דירה אמיתית</Link></>
    if (mine) return <><p className="meta">זה הפוסט שלך.</p><Link className="btn primary big" to={`/post/${id}/requests`}>צפייה בבקשות</Link></>
    if (!user) return <><p className="meta">התחברו כדי להגיש בקשה לדירה.</p><Link className="btn primary big" to="/new">התחברות</Link></>
    if (!isComplete(profile)) return <><p className="meta">כדי להגיש בקשה צריך פרופיל קצר, כך שבעל הדירה יכיר אתכם.</p><Link className="btn primary big" to={`/profile?next=/post/${id}`}>יצירת פרופיל</Link></>
    if (app === undefined) return <div className="skel" style={{ height: 120 }} />
    if (app?.status === 'chatting') return <>
      <p className="meta"><b>בעל הדירה פתח איתך שיחה.</b> זה שלב היכרות, וההחלטה הסופית עוד לא התקבלה.</p>
      {app.conversation_id && <button className="btn primary big" onClick={() => openChat(app.conversation_id)}><Icon n="chat" size={18} /> לצ'אט עם בעל הדירה</button>}
    </>
    if (app?.status === 'accepted') return <>
      <p className="ok"><Icon n="shield" size={16} /> אושרת כשותף/ה לדירה!</p>
      {app.conversation_id && <button className="btn primary big" onClick={() => openChat(app.conversation_id)}><Icon n="chat" size={18} /> לצ'אט עם בעל הדירה</button>}
      {social && <a className="btn soft big" href={social} target="_blank" rel="noreferrer noopener"><Icon n="link" size={17} /> פרופיל ברשת חברתית</a>}
    </>
    if (app) return <p className="meta">{STATUS_TXT[app.status]}</p>
    return (
      <form onSubmit={send} className="applyform">
        <label>הודעה לבעל הדירה
          <textarea rows="4" maxLength={600} required placeholder="הציגו את עצמכם בקצרה ותגידו למה הדירה מתאימה לכם" value={msg} onChange={e => setMsg(e.target.value)} />
        </label>
        <button className="btn primary big" disabled={busy}>{busy ? 'שולח…' : 'הגשת בקשה'}</button>
        <p className="safe"><Icon n="lock" size={14} /> בעל הדירה יראה את הפרופיל שלכם. טלפון ומייל לא נחשפים.</p>
      </form>
    )
  }

  return (
    <div className="postwrap">
      <Link to="/" className="back"><Icon n="arrow" size={16} /> חזרה לדירות</Link>
      <div className="postgrid">
        <div>
          {p.photos?.length > 0 ? <>
            <img className="gallery" src={p.photos[big]} alt="" />
            {p.photos.length > 1 && <div className="thumbs">{p.photos.map((u, i) => <img key={u} src={u} alt="" className={i === big ? 'on' : ''} onClick={() => setBig(i)} />)}</div>}
          </> : <Placeholder id={p.id} className="gallery" />}

          <div className="detail">
            <h1>{p.title}{p.is_sample && <span className="sampletag inline">דוגמה</span>}</h1>
            <div className="meta big"><Icon n="pin" size={17} /> {p.city}{p.neighborhood && ` · ${p.neighborhood}`}</div>
            <div className="facts">
              <div><b>{p.roommates_total}</b><span>דיירים</span></div>
              <div><b>{p.available_now ? 'מיידית' : p.available_from ? fmtDate(p.available_from) : 'גמישה'}</b><span>כניסה</span></div>
              <div><b>₪{p.rent.toLocaleString()}</b><span>לחודש</span></div>
            </div>
            {p.description && <><h3>על הדירה</h3><p className="desc">{p.description}</p></>}
            <h3>את מי מחפשים</h3>
            <div className="chips">{chips.length ? chips.map(c => <span key={c}>{c}</span>) : <span>פתוח לכולם</span>}</div>

            {p.roommates?.length > 0 && <>
              <h3>הדיירים בדירה</h3>
              <div className="mates">{p.roommates.map((m, i) => (
                <div key={i} className="mate"><span className="avatar" style={{ width: 40, height: 40 }}>{m.name?.[0]}</span>
                  <div><b>{m.name}{m.age ? `, ${m.age}` : ''}</b><div className="meta">{m.occupation}</div></div></div>))}</div>
            </>}

            {user && host && <><h3>מי מפרסם</h3><ProfileCard profile={host} compact /></>}
          </div>
        </div>

        <aside className="card contact">
          <div className="price">₪{p.rent.toLocaleString()}<small> / חודש</small></div>
          {contactBox()}
          {err && <p className="err">{err}</p>}
        </aside>
      </div>
    </div>
  )
}
