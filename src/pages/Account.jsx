import { Link, useNavigate } from 'react-router-dom'
import { api, isGuest, exitGuest } from '../api'
import ProfileCard from '../components/ProfileCard'
import Icon from '../components/Icon'
import { isComplete } from '../match'
import { isSoundOn, playDing, setSoundOn } from '../sound'
import { useState } from 'react'

// עמוד "פרופיל" (בנייד): הפרופיל שלי וכל מה שקשור אליו במקום אחד, בלי חלונות קופצים
export default function Account({ profile, pending = 0 }) {
  const nav = useNavigate()
  const [sound, setSound] = useState(isSoundOn())
  const row = (to, icon, label, badge) => (
    <Link to={to} className="acrow"><Icon n={icon} size={20} /><span>{label}</span>{badge > 0 && <i className="cnt">{badge}</i>}<Icon n="arrow" size={16} className="flip chev" /></Link>
  )
  return (
    <div className="narrow wide">
      <h2>הפרופיל שלי</h2>
      {isComplete(profile)
        ? <div className="card"><ProfileCard profile={profile} /></div>
        : <Link to="/profile" className="reqbanner" style={{ marginTop: 14 }}><Icon n="users" size={18} /><span>הפרופיל עדיין לא הושלם</span><b>להשלמה</b></Link>}
      <div className="card flush acrows">
        {row('/profile', 'pencil', 'עריכת הפרופיל')}
        {row('/mine', 'home', 'הפוסטים שלי')}
        {row('/inbox?tab=incoming', 'users', 'בקשות והודעות', pending)}
        <button className="acrow" onClick={() => { const on = !sound; setSound(on); setSoundOn(on); if (on) playDing('notif') }}>
          <Icon n="bell" size={20} /><span>צלילי התראה</span><b className="soundstate">{sound ? 'פועלים' : 'כבויים'}</b>
        </button>
      </div>
      {isGuest
        ? <button className="btn ghost big" onClick={exitGuest}>יציאה ממצב אורח</button>
        : api.mode === 'supabase' && <button className="btn ghost big" onClick={async () => { await api.signOut(); nav('/') }}>יציאה</button>}
    </div>
  )
}
