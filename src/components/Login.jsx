import { useState } from 'react'
import { api, hasBackend, enterGuest } from '../api'
export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  const submit = async e => {
    e.preventDefault()
    try { await api.signIn(email); setSent(true) } catch (x) { setErr(x.message) }
  }
  return (
    <form className="card narrow" onSubmit={submit}>
      <h2>התחברות</h2>
      <p>כדי לפרסם, להגיש בקשה או לשלוח הודעות צריך להתחבר. נשלח לכם קישור כניסה למייל, בלי סיסמה.</p>
      {sent ? <p className="ok">שלחנו קישור ל-{email}. לחצו עליו כדי להיכנס.</p> : <>
        <input type="email" required placeholder="האימייל שלך" value={email} onChange={e => setEmail(e.target.value)} />
        <button className="btn primary">שלחו לי קישור</button>
      </>}
      {err && <p className="err">{err}</p>}
      {hasBackend && <>
        <div className="or"><span>או</span></div>
        <button type="button" className="btn soft" onClick={enterGuest}>המשך כאורח, בלי הרשמה</button>
        <p className="meta">במצב אורח אפשר לעבור על כל האתר עם נתוני דוגמה. שום דבר לא נשלח לשרת.</p>
      </>}
    </form>
  )
}
