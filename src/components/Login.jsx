import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, hasBackend, enterGuest } from '../api'
import { usernameError } from '../blocklist'
import Icon from './Icon'
import NumberInput from './NumberInput'

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
  if (/invalid login/i.test(msg)) return 'שם משתמש/אימייל או סיסמה שגויים'
  if (/not confirmed/i.test(msg)) return 'unconfirmed'
  if (/rate limit|too many|seconds/i.test(msg)) return 'נשלחו יותר מדי בקשות. נסו שוב בעוד כמה דקות.'
  if (/database error|username/i.test(msg)) return 'שם המשתמש תפוס או לא תקין. נסו שם אחר.'
  if (/already registered|already been registered/i.test(msg)) return 'כבר קיים חשבון עם האימייל הזה'
  if (/password.*(weak|short|least)/i.test(msg)) return 'הסיסמה חלשה מדי'
  return msg
}

const IMG = 'https://images.unsplash.com/photo-1758525862263-af89b090fb56?auto=format&fit=crop&w=900&q=70'

function Shell({ children }) {
  return (
    <div className="authpage">
      <div className="authform">{children}</div>
      <aside className="authside" style={{ backgroundImage: `url(${IMG})` }}>
        <div className="authside-in">
          <h2>הבית הבא שלך מתחיל בשותפים הנכונים</h2>
          <ul>
            <li><Icon n="users" size={20} /> פרופיל אישי שמראה מי אתם באמת</li>
            <li><Icon n="sliders" size={20} /> אחוז התאמה לכל דירה</li>
            <li><Icon n="chat" size={20} /> צ'אט פרטי אחרי אישור בקשה</li>
            <li><Icon n="lock" size={20} /> הטלפון והמייל שלכם נשארים פרטיים</li>
          </ul>
        </div>
      </aside>
    </div>
  )
}

export default function Login() {
  const [q] = useSearchParams()
  const [mode, setMode] = useState(q.get('mode') === 'signup' ? 'signup' : 'signin') // signin | signup | forgot
  const [f, setF] = useState({ name: '', age: '', username: '', email: '', login: '', pw: '', pw2: '' })
  const [show, setShow] = useState(false)
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState('') // sent | reset
  const [unconfirmed, setUnconfirmed] = useState(false)
  const [taken, setTaken] = useState(false)
  const set = (k, v) => setF(s => ({ ...s, [k]: v }))
  const st = strength(f.pw)
  const uErr = usernameError(f.username)
  const go = m => { setMode(m); setErr(''); setDone(''); setUnconfirmed(false) }

  // בדיקת זמינות שם משתמש בזמן ההקלדה
  useEffect(() => {
    setTaken(false)
    if (mode !== 'signup' || !f.username || uErr) return
    const t = setTimeout(async () => setTaken(!(await api.usernameAvailable(f.username))), 450)
    return () => clearTimeout(t)
  }, [f.username, mode])

  const submit = async e => {
    e.preventDefault(); setErr(''); setUnconfirmed(false)
    if (mode === 'signup') {
      if (+f.age < 18 || +f.age > 99) return setErr('האתר מיועד לגילאי 18 ומעלה')
      if (uErr || !f.username) return setErr(uErr || 'בחרו שם משתמש')
      if (taken) return setErr('שם המשתמש תפוס')
      if (!passwordOk(f.pw)) return setErr('הסיסמה צריכה לכלול לפחות 8 תווים, אות אחת ומספר אחד')
      if (f.pw !== f.pw2) return setErr('הסיסמאות אינן זהות')
      if (!agree) return setErr('יש לאשר את תנאי השימוש ומדיניות הפרטיות')
    }
    setBusy(true)
    try {
      if (mode === 'signup') { await api.signUp(f.email.trim(), f.pw, { first_name: f.name.trim(), age: +f.age, username: f.username.trim() }); setDone('sent') }
      else if (mode === 'forgot') { await api.resetPassword(f.email.trim()); setDone('reset') }
      else await api.signInPassword(f.login.trim(), f.pw)
    } catch (x) {
      const m = explain(x.message || '')
      if (m === 'unconfirmed') { setUnconfirmed(true); setErr('האימייל עדיין לא אומת. לחצו על הקישור שנשלח אליכם במייל.') } else setErr(m)
    }
    setBusy(false)
  }
  const resend = async () => { try { await api.resendConfirmation(f.email.trim() || f.login.trim()); setErr(''); setDone('sent') } catch (x) { setErr(explain(x.message)) } }

  if (done) return (
    <Shell>
      <div className="authbox center">
        <span className="bigico"><Icon n="chat" size={30} /></span>
        <h2>{done === 'sent' ? 'בדקו את המייל' : 'שלחנו קישור לאיפוס'}</h2>
        <p>{done === 'sent' ? <>שלחנו הודעת אימות ל-<b dir="ltr">{f.email || f.login}</b>. לחצו על הקישור שבה כדי להפעיל את החשבון, ואז התחברו.</> : <>אם קיים חשבון עם <b dir="ltr">{f.email}</b>, נשלח אליו קישור לבחירת סיסמה חדשה.</>}</p>
        <p className="meta">לא הגיע? בדקו בתיקיית הספאם.</p>
        {done === 'sent' && <button className="btn soft" onClick={resend}>שליחה חוזרת</button>}
        <button className="btn ghost" onClick={() => go('signin')}>חזרה להתחברות</button>
      </div>
    </Shell>
  )

  return (
    <Shell>
      <form className="authbox" onSubmit={submit}>
        {mode !== 'forgot' && (
          <div className="tabs2" role="tablist">
            <button type="button" role="tab" aria-selected={mode === 'signin'} className={mode === 'signin' ? 'on' : ''} onClick={() => go('signin')}>התחברות</button>
            <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'on' : ''} onClick={() => go('signup')}>הרשמה</button>
          </div>
        )}
        <h2>{mode === 'signin' ? 'ברוכים השבים' : mode === 'signup' ? 'יצירת חשבון' : 'שכחתי סיסמה'}</h2>
        {mode === 'signup' && <p className="meta">כמה פרטים קצרים ואנחנו מתחילים. את השאר תשלימו בפרופיל.</p>}
        {mode === 'forgot' && <p className="meta">הזינו את האימייל ונשלח קישור לבחירת סיסמה חדשה.</p>}

        {mode === 'signup' && <>
          <div className="two">
            <label>שם פרטי<input required maxLength={30} autoComplete="given-name" value={f.name} onChange={e => set('name', e.target.value)} /></label>
            <div className="fw"><span>גיל</span><NumberInput required min={18} max={99} value={f.age} onChange={v => set('age', v)} /></div>
          </div>
          <label>שם משתמש
            <input required dir="ltr" autoComplete="username" maxLength={20} placeholder="לדוגמה: yogev_27" value={f.username} onChange={e => set('username', e.target.value.trim())} />
            {f.username && (uErr ? <span className="hint bad">{uErr}</span> : taken ? <span className="hint bad">שם המשתמש תפוס</span> : <span className="hint good">שם המשתמש פנוי</span>)}
            {!f.username && <span className="hint">3 עד 20 תווים: אותיות, ספרות וקו תחתון. יוצג רק לכם ולכניסה.</span>}
          </label>
        </>}

        {mode === 'signin'
          ? <label>אימייל או שם משתמש<input required dir="ltr" autoComplete="username" value={f.login} onChange={e => set('login', e.target.value)} /></label>
          : <label>אימייל<input type="email" required autoComplete="email" dir="ltr" placeholder="name@example.com" value={f.email} onChange={e => set('email', e.target.value)} /></label>}

        {mode !== 'forgot' && (
          <label>סיסמה
            <div className="pwwrap">
              <input type={show ? 'text' : 'password'} required dir="ltr" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={f.pw} onChange={e => set('pw', e.target.value)} />
              <button type="button" className="eye" aria-label={show ? 'הסתר סיסמה' : 'הצג סיסמה'} onClick={() => setShow(s => !s)}>{show ? 'הסתר' : 'הצג'}</button>
            </div>
          </label>
        )}

        {mode === 'signup' && <>
          {f.pw && <div className={'meter m' + st.n}><i /><i /><i /><span>סיסמה {st.label}</span></div>}
          <p className="meta small">לפחות 8 תווים, כולל אות ומספר. כדאי להוסיף אות גדולה וסימן מיוחד.</p>
          <label>אימות סיסמה<input type={show ? 'text' : 'password'} required dir="ltr" autoComplete="new-password" value={f.pw2} onChange={e => set('pw2', e.target.value)} /></label>
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
        </>}
      </form>
    </Shell>
  )
}
