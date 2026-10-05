import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import PostCard from '../components/PostCard'
import Icon from '../components/Icon'
import HeroCarousel from '../components/HeroCarousel'
import NumberInput from '../components/NumberInput'
import { hasProfile, matchScore, profileToFilter } from '../match'
import { useFavs } from '../favs'

const empty = { q: '', maxRent: '', gender: 'any', smoking: 'any', pets: 'any', occ: 'any', age: '' }

export default function Feed({ profile }) {
  const [posts, setPosts] = useState(null)
  const [f, setF] = useState(empty)
  const [open, setOpen] = useState(false)
  const [onlyFavs, setOnlyFavs] = useState(false)
  const [favs, toggleFav] = useFavs()
  const [err, setErr] = useState('')
  useEffect(() => { api.listPosts().then(setPosts).catch(e => setErr(e.message)) }, [])
  useEffect(() => { if (profile) setF(s => ({ ...s, ...profileToFilter(profile) })) }, [profile?.user_id, profile?.age])
  const set = (k, v) => setF(s => ({ ...s, [k]: v }))

  const cities = useMemo(() => [...new Set((posts || []).map(p => p.city))], [posts])
  const matched = hasProfile(f)
  const filtered = f.q || f.maxRent || matched || onlyFavs

  const shown = useMemo(() => (posts || [])
    .filter(p => {
      const q = f.q.trim()
      if (q && !`${p.city} ${p.neighborhood || ''} ${p.title}`.includes(q)) return false
      if (f.maxRent && p.rent > +f.maxRent) return false
      if (onlyFavs && !favs.includes(p.id)) return false
      return true
    })
    .map(p => ({ p, score: matchScore(p, f) }))
    .sort((a, b) => (a.p.is_sample ? 1 : 0) - (b.p.is_sample ? 1 : 0) || (b.score ?? 0) - (a.score ?? 0)), [posts, f, onlyFavs, favs])

  return (
    <>
      <HeroCarousel>
        <h1>מצאו את <span className="hl">השותפים הנכונים</span> לדירה</h1>
        <p>דירות עם חדר פנוי, קריטריונים ברורים, וצ'אט ישיר עם הדיירים. חינם לגמרי.</p>
        <div className="searchbar">
          <label className="seg grow"><span>איפה</span><input placeholder="עיר או שכונה" value={f.q} onChange={e => set('q', e.target.value)} /></label>
          <div className="seg"><span>שכ״ד עד</span><NumberInput step={500} value={f.maxRent} onChange={v => set('maxRent', v)} placeholder="ללא הגבלה" suffix="₪" /></div>
          <button className="go" aria-label="חיפוש" onClick={() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })}><Icon n="search" size={20} /></button>
        </div>
      </HeroCarousel>

      <div className="pills">
        <button className={'pill' + (open || matched ? ' on' : '')} onClick={() => setOpen(o => !o)}>
          <Icon n="sliders" size={16} /> ההתאמה שלי{matched && <i className="dot" />}
        </button>
        <span className="sep" />
        {cities.map(c => <button key={c} className={'pill' + (f.q === c ? ' on' : '')} onClick={() => set('q', f.q === c ? '' : c)}>{c}</button>)}
        <button className={'pill' + (onlyFavs ? ' on' : '')} onClick={() => setOnlyFavs(v => !v)}><Icon n="heart" size={15} fill={onlyFavs} /> שמורים{favs.length ? ` ${favs.length}` : ''}</button>
        {filtered && <button className="pill clear" onClick={() => { setF(empty); setOnlyFavs(false) }}><Icon n="x" size={14} /> נקה</button>}
      </div>

      {open && (
        <div className="profilebox">
          <div><h3>ההתאמה שלי</h3><p className="meta">{profile ? 'מילאנו לפי הפרופיל שלכם. אפשר לשנות כאן זמנית.' : 'ספרו על עצמכם ונציג לכל דירה אחוז התאמה אישי.'}</p></div>
          <div className="pgrid">
            <label>אני<select value={f.gender} onChange={e => set('gender', e.target.value)}><option value="any">לא משנה</option><option value="male">גבר</option><option value="female">אישה</option></select></label>
            <div className="fw"><span>גיל</span><NumberInput min={18} max={99} value={f.age} onChange={v => set('age', v)} /></div>
            <label>עישון<select value={f.smoking} onChange={e => set('smoking', e.target.value)}><option value="any">לא משנה</option><option value="yes">אני מעשן/ת</option><option value="no">אני לא מעשן/ת</option></select></label>
            <label>חיית מחמד<select value={f.pets} onChange={e => set('pets', e.target.value)}><option value="any">לא משנה</option><option value="yes">יש לי</option><option value="no">אין לי</option></select></label>
            <label>עיסוק<select value={f.occ} onChange={e => set('occ', e.target.value)}><option value="any">לא משנה</option><option value="student">סטודנט/ית</option><option value="working">עובד/ת</option></select></label>
          </div>
        </div>
      )}

      {err && <p className="err">{err}</p>}
      <div className="sectionhead" id="results">
        <h2>{matched ? 'מותאם בשבילך' : 'דירות עם חדר פנוי'}</h2>
        {posts && <span className="meta">{shown.length} תוצאות</span>}
      </div>
      {posts === null ? <div className="grid">{[0, 1, 2, 3].map(i => <div key={i} className="skel" />)}</div> :
        shown.length === 0 ? (
          <div className="emptystate">
            <span className="bigico"><Icon n="search" size={30} /></span>
            <h3>{filtered ? 'לא מצאנו דירות שמתאימות' : 'עדיין אין דירות באתר'}</h3>
            <p>{filtered ? 'נסו להרחיב את החיפוש או לנקות את הסינון.' : 'היו הראשונים לפרסם חדר פנוי ולמצוא שותפים.'}</p>
            <div className="actions center">
              {filtered && <button className="btn soft" onClick={() => { setF(empty); setOnlyFavs(false) }}>ניקוי סינון</button>}
              <Link to="/new" className="btn primary">פרסמו דירה</Link>
            </div>
          </div>) :
        <div className="grid">{shown.map(({ p, score }, i) => <PostCard key={p.id} p={p} score={score} mine={!!profile && p.owner_id === profile.user_id} index={i} fav={favs.includes(p.id)} onFav={toggleFav} />)}</div>}

      <section className="how">
        <h2>איך זה עובד</h2>
        <div className="steps">
          <div className="step"><span className="ico"><Icon n="pencil" size={24} /></span><h3>מפרסמים</h3><p>תמונות, מחיר וקריטריונים לשותף שאתם מחפשים.</p></div>
          <div className="step"><span className="ico"><Icon n="users" size={24} /></span><h3>מתאימים</h3><p>כל מתעניין רואה אחוז התאמה אישי לדירה שלכם.</p></div>
          <div className="step"><span className="ico"><Icon n="chat" size={24} /></span><h3>מדברים</h3><p>צ'אט פרטי באתר, בלי לחשוף מספר טלפון.</p></div>
        </div>
        <div className="trust">
          <span><Icon n="zero" size={20} /> בלי עמלות, חינם תמיד</span>
          <span><Icon n="lock" size={20} /> הטלפון שלכם נשאר פרטי</span>
          <span><Icon n="shield" size={20} /> אתם מחליטים מי נכנס</span>
        </div>
        <div className="cta"><div><h3>יש לכם חדר פנוי?</h3><p>פרסום לוקח פחות מדקה ועולה 0 ₪.</p></div><Link to="/new" className="btn primary big">פרסמו דירה</Link></div>
      </section>
    </>
  )
}
