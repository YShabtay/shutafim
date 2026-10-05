import { tintFor } from './Placeholder'
export default function Avatar({ profile, size = 44 }) {
  const name = profile?.first_name || '?'
  const [bg, fg] = tintFor(profile?.user_id || name)
  return profile?.photo
    ? <img className="avatar" src={profile.photo} alt="" style={{ width: size, height: size }} />
    : <span className="avatar" style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.42 }}>{name[0]}</span>
}
