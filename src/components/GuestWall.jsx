import { Link } from 'react-router-dom'
import { exitGuest } from '../api'
import Icon from './Icon'

// אורחים רק צופים. כל פעולה אחרת מובילה לכאן.
export default function GuestWall() {
  return (
    <div className="card narrow">
      <div className="authbox center">
        <span className="bigico"><Icon n="lock" size={30} /></span>
        <h2>צריך חשבון כדי להמשיך</h2>
        <p>כאורחים אפשר לדפדף ולצפות במודעות בלבד. כדי לפרסם דירה, להגיש בקשה, לשלוח הודעות או לדווח, צריך להירשם. זה חינם ולוקח דקה.</p>
        <button className="btn primary big" onClick={() => exitGuest('/login?mode=signup')}>הרשמה</button>
        <button className="btn soft" onClick={() => exitGuest('/login')}>כבר יש לי חשבון</button>
        <Link to="/" className="linkbtn">חזרה לצפייה במודעות</Link>
      </div>
    </div>
  )
}
