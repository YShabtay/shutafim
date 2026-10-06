import { NavLink } from 'react-router-dom'
import Icon from './Icon'

// סרגל צף בתחתית (בנייד בלבד). כל פריט מוביל לעמוד, בלי חלונות קופצים.
export default function BottomBar({ msgBadge = 0, notifBadge = 0 }) {
  const item = (to, icon, label, badge = 0, extra = '') => (
    <NavLink to={to} className={({ isActive }) => 'bb-item ' + extra + (isActive ? ' on' : '')}>
      <span className="bb-ic"><Icon n={icon} size={extra === 'plus' ? 24 : 22} />{badge > 0 && <i className="bellbadge">{badge > 9 ? '9+' : badge}</i>}</span>
      <span className="bb-lbl">{label}</span>
    </NavLink>
  )
  return (
    <nav className="bottombar" aria-label="ניווט ראשי">
      {item('/', 'home', 'בית')}
      {item('/inbox?tab=chats', 'chat', 'הודעות', msgBadge)}
      {item('/new', 'plus', 'פרסום', 0, 'plus')}
      {item('/notifications', 'bell', 'התראות', notifBadge)}
      {item('/account', 'user', 'פרופיל')}
    </nav>
  )
}
