import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, hasBackend, enterGuest } from '../api'
import Icon from './Icon'

// סיסמה: לפחות 8 תווים, אות ומספר. הדירוג עוזר לבחור סיסמה חזקה יותר.
export const passwordOk = p => p.length >= 8 && /[A-Za-z֐-׿]/.test(p) && /\d/.test(p)
function strength(p) {
  let n = 0
  if (p.length >= 8) n++
  if (p.length >= 12) n++
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) n++
  if (/\d/.test(p)) n++
  if (/[^A-Za-z0-9]/.test(p)) n++
  return n <= 2 ? { n: 1, label: 'חלשה' } : n <= 3 ? { n: 2, label: 'בינונית' } : { n: 3, label: 'חזקה' }
}
const explain = msg => {
  if (/invalid login/i.test(msg)) return 'אימייל או סיסמה שגויים'
  if (/not confirmed/i.test(msg)) return 'unconfirmed'
  if (/rate limit|too many|seconds/i.test(msg)) return 'נשלחו יותר מדי בקשות. נסו שוב בעוד כמה דקות.'
  if (/password.*(weak|short|least)/i.test(msg)) return 'הסיסמה חלשה מדי'
  return msg
}

export default function Login() {
  const [q] = useSearchParams()
  const [mode, setMode] = useState(q.get('mode') === 'signup' ? 'signup' : 'signin') // signin | signup | forgot
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [show, setShow] = useState(false)
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState('') // sent | reset
  const [unconfirmed, setUnconfirmed] = useState(false)
  const st = strength(pw)
  const go = m => { setMode(m); setErr(''); setDone(''); setUnconfirmed(false) }

  const submit = async e => {
    e.preventDefault(); setErr(''); setUnconfirmed(false)
    if (mode === 'signup') {
      if (!passwordOk(pw)) return setErr('הסיסמה צריכה לכלול לפחות 8 תווים, אות אחת ומספר אחד')
      if (pw !== pw2) return setErr('הסיסמאות אינן זהות')
      if (!agree) return setErr('יש לאשר את תנאי השימוש ומדיניות הפרטיות')
    }
    setBusy(true)
    try {
      if (mode === 'signup') { await api.signUp(email.trim(), pw); setDone('sent') }
      else if (mode === 'forgot') { await api.resetPassword(email.trim()); setDone('reset') }
      else await api.signInPassword(email.trim(), pw)
    } catch (x) {
      const m = explain(x.message || '')
      if (m === 'unconfirmed') { setUnconfirmed(true); setErr('האימייל עדיין לא אומת. לחצו על הקישור שנשלח אליכם במייל.') } else setErr(m)
    }
    setBusy(false)
  }
  const resend = async () => { try { await api.resendConfirmation(email.trim()); setErr(''); setDone('sent') } catch (x) { setErr(explain(x.message)) } }

  if (done) return (
    <div className="card narrow authbox center">
      <span className="bigico"><Icon n="chat" size={30} /></span>
      <h2>{done === 'sent' ? 'בדקו את המייל' : 'שלחנו קישור לאיפוס'}</h2>
      <p>{done === 'sent' ? <>שלחנו הודעת אימות ל-<b dir="ltr">{email}</b>. לחצו על הקישור שבה כדי להפעיל את החשבון, ואז התחברו.</> : <>אם קיים חשבון עם <b dir="ltr">{email}</b>, נשלח אליו קישור לבחירת סיסמה חדשה.</>}</p>
      <p className="meta">לא הגיע? בדקו בתיקיית הספאם.</p>
      {done === 'sent' && <button className="btn soft" onClick={resend}>שליחה חוזרת</button>}
      <button className="btn ghost" onClick={() => go('signin')}>חזרה להתחברות</button>
    </div>
  )

  return (
    <form className="card narrow authbox" onSubmit={submit}>
      {mode !== 'forgot' && (
        <div className="tabs2" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'signin'} className={mode === 'signin' ? 'on' : ''} onClick={() => go('signin')}>התחברות</button>
          <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'on' : ''} onClick={() => go('signup')}>הרשמה</button>
        </div>
      )}
      <h2>{mode === 'signin' ? 'ברוכים השבים' : mode === 'signup' ? 'יצירת חשבון' : 'שכחתי סיסמה'}</h2>
      {mode === 'forgot' && <p className="meta">הזינו את האימייל ונשלח קישור לבחירת סיסמה חדשה.</p>}

      <label>אימייל<input type="email" required autoComplete="email" dir="ltr" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} /></label>

      {mode !== 'forgot' && (
        <label>סיסמה
          <div className="pwwrap">
            <input type={show ? 'text' : 'password'} required dir="ltr" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={pw} onChange={e => setPw(e.target.value)} />
            <button type="button" className="eye" aria-label={show ? 'הסתר סיסמה' : 'הצג סיסמה'} onClick={() => setShow(s => !s)}>{show ? 'הסתר' : 'הצג'}</button>
          </div>
        </label>
      )}

      {mode === 'signup' && <>
        {pw && <div className={'meter m' + st.n}><i /><i /><i /><span>סיסמה {st.label}</span></div>}
        <p className="meta small">לפחות 8 תווים, כולל אות ומספר. כדאי להוסיף אות גדולה וסימן מיוחד.</p>
        <label>אימות סיסמה<input type={show ? 'text' : 'password'} required dir="ltr" autoComplete="new-password" value={pw2} onChange={e => setPw2(e.target.value)} /></label>
        <label className="check"><input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
          <span>אני בן/בת 18 ומעלה ומאשר/ת את <Link to="/legal/terms" target="_blank">תנאי השימוש</Link> ואת <Link to="/legal/privacy" target="_blank">מדיניות הפרטיות</Link></span></label>
      </>}

      {err && <p className="err">{err}</p>}
      {unconfirmed && <button type="button" className="btn soft" onClick={resend}>שלחו לי שוב מייל אימות</button>}
      <button className="btn primary big" disabled={busy}>{busy ? 'רגע…' : mode === 'signin' ? 'התחברות' : mode === 'signup' ? 'יצירת חשבון' : 'שליחת קישור'}</button>

      {mode === 'signin' && <button type="button" className="linkbtn" onClick={() => go('forgot')}>שכחתי סיסמה</button>}
      {mode === 'forgot' && <button type="button" className="linkbtn" onClick={() => go('signin')}>חזרה להתחברות</button>}

      {hasBackend && mode !== 'forgot' && <>
        <div className="or"><span>או</span></div>
        <button type="button" className="btn soft" onClick={enterGuest}>המשך כאורח, בלי הרשמה</button>
        <p className="meta small">במצב אורח אפשר לעבור על כל האתר עם נתוני דוגמה. שום דבר לא נשלח לשרת.</p>
      </>}
    </form>
  )
}
