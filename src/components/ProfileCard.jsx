import Avatar from './Avatar'
import { OCC, traitChips } from '../labels'
export default function ProfileCard({ profile, title, compact = false }) {
  if (!profile) return <p className="meta">אין פרופיל זמין.</p>
  return (
    <div className={'prof' + (compact ? ' compact' : '')}>
      <div className="prof-head">
        <Avatar profile={profile} size={compact ? 48 : 64} />
        <div>
          {title && <div className="meta">{title}</div>}
          <b className="prof-name">{profile.first_name}, {profile.age}</b>
          <div className="meta">{OCC[profile.occupation]}</div>
        </div>
      </div>
      {profile.bio && <p className="prof-bio">{profile.bio}</p>}
      <div className="chips">{traitChips(profile).map(c => <span key={c}>{c}</span>)}</div>
    </div>
  )
}
