import { Link } from 'react-router-dom'
import NotifPanel from '../components/NotifPanel'

// עמוד התראות (בנייד)
export default function Notifications({ notifs }) {
  return (
    <div className="narrow wide">
      <div className="pagehead"><h2>התראות</h2><Link to="/inbox?tab=incoming">לכל הבקשות</Link></div>
      <div className="card flush"><NotifPanel notifs={notifs} /></div>
    </div>
  )
}
