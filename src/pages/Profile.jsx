import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import Avatar from '../components/Avatar'
import NumberInput from '../components/NumberInput'
import { isComplete } from '../match'

const init = { first_name: '', age: '', gender: '', occupation: '', smoking: 'no', has_pet: false, cleanliness: 'normal',
  sleep: 'flexible', guests: 'sometimes', kosher: false, bio: '', budget: '', move_date: '' }

export default function Profile({ profile, onSaved }) {
  const [f, setF] = useState(() => ({ ...init, ...(profile || {}), age: profile?.age ? String(profile.age) : '', budget: profile?.budget ? String(profile.budget) : '', move_date: profile?.move_date || '' }))
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [q] = useSearchParams()
  const next = q.get('next')
  const nav = useNavigate()
  const set = (k, v) => setF(s => ({ ...s, [k]: v }))
  const bind = k => ({ value: f[k], onChange: e => set(k, e.target.value) })
  const preview = file ? { ...f, photo: URL.createObjectURL(file) } : f

  const submit = async e => {
    e.preventDefault(); setErr('')
    if (!isComplete({ ...f, age: +f.age })) { setErr('חסרים שדות חובה'); return }
    if (+f.age < 18) { setErr('האתר מיועד לגילאי 18 ומעלה'); return }
    setBusy(true)
    try {
      const { budget, move_date, ...rest } = f
      const saved = await api.saveProfile({ ...rest, age: +f.age, budget: budget ? +budget : null, move_date: move_date || null }, file)
      onSaved(saved); nav(next || '/')
    } catch (x) { setErr(x.message); setBusy(false) }
  }

  return (
    <form className="card narrow form" onSubmit={submit}>
      <h2>{profile ? 'הפרופיל שלי' : 'בואו נכיר'}</h2>
      <p className="meta">{next ? 'כדי להמשיך צריך פרופיל קצר. ' : ''}שותפים בוחרים אחד את השני, ופרופיל כנה עוזר למצוא התאמה אמיתית. אין בו טלפון או מייל.</p>

      <div className="photorow">
        <Avatar profile={preview} size={72} />
        <label className="btn soft">העלאת תמונה<input type="file" accept="image/*" hidden onChange={e => setFile(e.target.files[0] || null)} /></label>
      </div>

      <div className="two">
        <label>שם פרטי *<input required maxLength={30} {...bind('first_name')} /></label>
        <div className="fw"><span>גיל *</span><NumberInput required min={18} max={99} value={f.age} onChange={v => set('age', v)} /></div>
      </div>
      <div className="two">
        <label>מגדר *<select required {...bind('gender')}><option value="">בחרו</option><option value="male">גבר</option><option value="female">אישה</option><option value="other">אחר</option></select></label>
        <label>עיסוק *<select required {...bind('occupation')}><option value="">בחרו</option><option value="student">סטודנט/ית</option><option value="working">עובד/ת</option></select></label>
      </div>

      <h3>סגנון חיים</h3>
      <div className="two">
        <label>עישון<select {...bind('smoking')}><option value="no">לא מעשן/ת</option><option value="yes">מעשן/ת</option></select></label>
        <label>ניקיון<select {...bind('cleanliness')}><option value="relaxed">רגוע/ה</option><option value="normal">סביר</option><option value="tidy">מסודר/ת מאוד</option></select></label>
      </div>
      <div className="two">
        <label>שעות<select {...bind('sleep')}><option value="early">קם/ה מוקדם</option><option value="flexible">גמישות</option><option value="night">ינשוף לילה</option></select></label>
        <label>אורחים<select {...bind('guests')}><option value="rare">לעיתים רחוקות</option><option value="sometimes">לפעמים</option><option value="often">הרבה</option></select></label>
      </div>
      <label className="check"><input type="checkbox" checked={f.has_pet} onChange={e => set('has_pet', e.target.checked)} /> יש לי חיית מחמד</label>
      <label className="check"><input type="checkbox" checked={f.kosher} onChange={e => set('kosher', e.target.checked)} /> שומר/ת כשרות</label>

      <label>קצת עליי<textarea rows="4" maxLength={400} placeholder="במה אתם עובדים או לומדים, מה אתם אוהבים, איזה שותף אתם מחפשים" {...bind('bio')} /></label>

      <h3>אם אני מחפש/ת דירה</h3>
      <div className="two">
        <div className="fw"><span>תקציב לחודש (₪)</span><NumberInput step={100} value={f.budget} onChange={v => set('budget', v)} suffix="₪" /></div>
        <label>תאריך כניסה רצוי<input type="date" {...bind('move_date')} /></label>
      </div>
      {err && <p className="err">{err}</p>}
      <button className="btn primary big" disabled={busy}>{busy ? 'שומר…' : 'שמירה'}</button>
    </form>
  )
}
