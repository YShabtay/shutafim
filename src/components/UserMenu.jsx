import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import Icon from './Icon'
import { isComplete } from '../match'
import { isSoundOn, playDing, setSoundOn } from '../sound'

export default function UserMenu({ profile, pending = 0, canSignOut, onSignOut }) {
  const [open, setOpen] = useState(false)
  const [sound, setSound] = useState(isSoundOn())
  const ref = useRef()
  useEffect(() => {
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [])
  const incomplete = !isComplete(profile)
  return (
    <div className="umenu" ref={ref}>
      <button className="uavatar" aria-label="תפריט משתמש" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Avatar profile={profile || { first_name: '?' }} size={38} />
        {incomplete && <i className="udot" />}
      </button>
      {open && (
        <div className="udrop" onClick={() => setOpen(false)}>
          {profile?.first_name && <div className="uhead"><b>{profile.first_name}</b>{profile.username && <span dir="ltr">@{profile.username}</span>}</div>}
          {incomplete && <Link to="/profile" className="ucomplete">השלמת פרופיל</Link>}
          <Link to="/profile">הפרופיל שלי</Link>
          <Link to="/mine">הפוסטים שלי</Link>
          <Link to="/inbox" className="withcnt">בקשות והודעות{pending > 0 && <i className="cnt">{pending}</i>}</Link>
          <button onClick={e => { e.stopPropagation(); const on = !sound; setSound(on); setSoundOn(on); if (on) playDing('notif') }}>{sound ? 'צלילי התראה: פועלים' : 'צלילי התראה: כבויים'}</button>
          {canSignOut && <button onClick={onSignOut}>יציאה</button>}
        </div>
      )}
    </div>
  )
}
