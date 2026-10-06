import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import NumberInput from '../components/NumberInput'
import { prepareImage } from '../image'

const init = { available_now: false, roommates: [], title: '', city: '', neighborhood: '', rent: '', available_from: '', roommates_total: 2, description: '', socialType: 'none', socialHandle: '',
  pref_gender: 'any', pref_age_min: '', pref_age_max: '', pref_smoking: 'any', pref_pets: 'any', pref_kosher: false, pref_occupation: 'any' }

const SOCIAL = { instagram: 'https://instagram.com/', facebook: 'https://facebook.com/', telegram: 'https://t.me/' }
function socialUrl(type, handle) {
  const h = handle.trim()
  if (type === 'none' || !h) return ''
  if (/^https?:\/\//i.test(h)) return h
  return SOCIAL[type] + h.replace(/^@/, '')
}

function parseSocial(u) {
  if (!u) return { socialType: 'none', socialHandle: '' }
  for (const [type, pre] of Object.entries(SOCIAL)) if (u.startsWith(pre)) return { socialType: type, socialHandle: '@' + u.slice(pre.length) }
  return { socialType: 'instagram', socialHandle: u }
}
const fromPost = (p, social) => ({
  ...init, title: p.title, city: p.city, neighborhood: p.neighborhood || '', rent: String(p.rent), available_from: p.available_from || '',
  available_now: !!p.available_now, roommates_total: p.roommates_total || 2, description: p.description || '',
  pref_gender: p.pref_gender, pref_occupation: p.pref_occupation, pref_smoking: p.pref_smoking, pref_pets: p.pref_pets, pref_kosher: !!p.pref_kosher,
  pref_age_min: p.pref_age_min ? String(p.pref_age_min) : '', pref_age_max: p.pref_age_max ? String(p.pref_age_max) : '',
  roommates: (p.roommates || []).map(m => ({ name: m.name || '', age: m.age ? String(m.age) : '', occupation: m.occupation || '' })),
  ...parseSocial(social),
})

// יצירת פוסט חדש, או עריכה של פוסט קיים כשמעבירים post
export default function NewPost({ post, social }) {
  const editing = !!post
  const [f, setF] = useState(() => (post ? fromPost(post, social) : init))
  const [keep, setKeep] = useState(post?.photos || [])
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const nav = useNavigate()
  const set = (k, v) => setF(s => ({ ...s, [k]: v }))
  const setMate = (i, k, v) => set('roommates', f.roommates.map((m, j) => (j === i ? { ...m, [k]: v } : m)))
  const bind = k => ({ value: f[k], onChange: e => set(k, e.target.value) })
  const num = v => (v === '' ? null : +v)

  const submit = async e => {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      const { socialType, socialHandle, ...rest } = f
      const payload = {
        ...rest, roommates: f.roommates.filter(m => m.name.trim()).map(m => ({ name: m.name.trim(), age: m.age ? +m.age : null, occupation: m.occupation.trim() })), social: socialUrl(socialType, socialHandle), rent: +f.rent, roommates_total: +f.roommates_total,
        pref_age_min: num(f.pref_age_min), pref_age_max: num(f.pref_age_max),
        available_from: f.available_from || null,
      }
      const room = Math.max(0, 6 - keep.length)
      const saved = editing ? await api.updatePost(post.id, payload, files.slice(0, room), keep) : await api.createPost(payload, files.slice(0, 6))
      nav(`/post/${saved.id}`)
    } catch (x) { setErr(x.message); setBusy(false) }
  }

  return (
    <form className="card narrow form" onSubmit={submit}>
      <h2>{editing ? 'עריכת הפוסט' : 'פרסום דירה לשותפים'}</h2>
      <label>כותרת<input required maxLength={80} placeholder="למשל: חדר בדירת 3 חדרים בפלורנטין" {...bind('title')} /></label>
      <div className="two">
        <label>עיר<input required {...bind('city')} /></label>
        <label>שכונה<input {...bind('neighborhood')} /></label>
      </div>
      <div className="two">
        <div className="fw"><span>שכ״ד לחודש (₪)</span><NumberInput required step={100} value={f.rent} onChange={v => set('rent', v)} suffix="₪" /></div>
        <div className="fw"><span>סה״כ דיירים בדירה</span><NumberInput min={2} max={10} value={String(f.roommates_total)} onChange={v => set('roommates_total', v || '2')} /></div>
      </div>
      <div className="fw"><span>תאריך כניסה</span>
        <input type="date" disabled={f.available_now} {...bind('available_from')} />
        <label className="check inline"><input type="checkbox" checked={f.available_now} onChange={e => setF(s => ({ ...s, available_now: e.target.checked, available_from: e.target.checked ? '' : s.available_from }))} /> כניסה מיידית</label></div>
      <label>תיאור<textarea rows="4" {...bind('description')} /></label>
      {keep.length > 0 && <div className="keepphotos">{keep.map(u => (
        <div key={u} className="keepph"><img src={u} alt="" /><button type="button" aria-label="הסר תמונה" onClick={() => setKeep(k => k.filter(x => x !== u))}>✕</button></div>))}</div>}
      <label>{editing ? 'הוספת תמונות' : 'תמונות'} (עד 6 בסך הכול)<input type="file" accept="image/*" multiple onChange={async e => { setErr(''); try { setFiles(await Promise.all([...e.target.files].map(prepareImage))) } catch { setErr('לא הצלחנו לקרוא אחת התמונות. נסו תמונה אחרת.') } }} /></label>

      <h3>הדיירים בדירה</h3>
      <p className="meta">מי כבר גר שם? מי שמגיש בקשה רוצה להכיר גם אותם.</p>
      {f.roommates.map((m, i) => (
        <div key={i} className="mrow">
          <input placeholder="שם" value={m.name} onChange={e => setMate(i, 'name', e.target.value)} />
          <input className="narrowin" inputMode="numeric" placeholder="גיל" value={m.age} onChange={e => setMate(i, 'age', e.target.value.replace(/\D/g, ''))} />
          <input placeholder="עיסוק" value={m.occupation} onChange={e => setMate(i, 'occupation', e.target.value)} />
          <button type="button" className="btn ghost" aria-label="הסר" onClick={() => set('roommates', f.roommates.filter((_, j) => j !== i))}>✕</button>
        </div>))}
      <button type="button" className="btn soft" onClick={() => set('roommates', [...f.roommates, { name: '', age: '', occupation: '' }])}>+ הוספת דייר</button>

      <h3>קריטריונים לשותף/ה</h3>
      <div className="two">
        <label>מגדר<select {...bind('pref_gender')}><option value="any">לא משנה</option><option value="male">גברים</option><option value="female">נשים</option></select></label>
        <label>עיסוק<select {...bind('pref_occupation')}><option value="any">לא משנה</option><option value="student">סטודנט/ית</option><option value="working">עובד/ת</option></select></label>
      </div>
      <div className="two">
        <div className="fw"><span>גיל מינימום</span><NumberInput min={18} max={99} value={f.pref_age_min} onChange={v => set('pref_age_min', v)} /></div>
        <div className="fw"><span>גיל מקסימום</span><NumberInput min={18} max={99} value={f.pref_age_max} onChange={v => set('pref_age_max', v)} /></div>
      </div>
      <div className="two">
        <label>עישון<select {...bind('pref_smoking')}><option value="any">לא משנה</option><option value="no">ללא עישון</option><option value="yes">עישון מותר</option></select></label>
        <label>חיות מחמד<select {...bind('pref_pets')}><option value="any">לא משנה</option><option value="no">ללא חיות</option><option value="yes">חיות בסדר</option></select></label>
      </div>
      <label className="check"><input type="checkbox" checked={f.pref_kosher} onChange={e => set('pref_kosher', e.target.checked)} /> דירה שומרת כשרות</label>

      <h3>יצירת קשר</h3>
      <p className="meta">מתעניינים ישלחו לך הודעה בצ'אט באתר, בלי לחשוף מספר טלפון. אפשר להוסיף גם פרופיל ברשת חברתית.</p>
      <div className="two">
        <label>רשת חברתית (אופציונלי)<select {...bind('socialType')}><option value="none">ללא</option><option value="instagram">אינסטגרם</option><option value="facebook">פייסבוק</option><option value="telegram">טלגרם</option></select></label>
        <label>שם משתמש או קישור<input disabled={f.socialType === 'none'} placeholder="@username" {...bind('socialHandle')} /></label>
      </div>
      {err && <p className="err">{err}</p>}
      <button className="btn primary" disabled={busy}>{busy ? 'שומר…' : editing ? 'שמירת שינויים' : 'פרסום'}</button>
    </form>
  )
}
