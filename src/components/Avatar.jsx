export default function Avatar({ profile, size = 44 }) {
  const name = profile?.first_name || '?'
  return profile?.photo
    ? <img className="avatar" src={profile.photo} alt="" style={{ width: size, height: size }} />
    : <span className="avatar plain" style={{ width: size, height: size, fontSize: size * 0.42 }}>{name[0]}</span>
}
