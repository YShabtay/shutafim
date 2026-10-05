import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { passwordOk } from '../components/Login'

export default function ResetPassword() {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()
  const submit = async e => {
    e.preventDefault(); setErr('')
    if (!passwordOk(pw)) return setErr('הסיסמה צריכה לכלול לפחות 8 תווים, אות אחת ומספר אחד')
    if (pw !== pw2) return setErr('הסיסמאות אינן זהות')
    setBusy(true)
    try { await api.updatePassword(pw); nav('/', { replace: true }) } catch (x) { setErr(x.message); setBusy(false) }
  }
  return (
    <form className="card narrow authbox" onSubmit={submit}>
      <h2>בחירת סיסמה חדשה</h2>
      <label>סיסמה חדשה<input type="password" required dir="ltr" autoComplete="new-password" value={pw} onChange={e => setPw(e.target.value)} /></label>
      <label>אימות סיסמה<input type="password" required dir="ltr" autoComplete="new-password" value={pw2} onChange={e => setPw2(e.target.value)} /></label>
      {err && <p className="err">{err}</p>}
      <button className="btn primary big" disabled={busy}>{busy ? 'שומר…' : 'שמירת סיסמה'}</button>
    </form>
  )
}
