import { Link } from 'react-router-dom'
import { exitGuest } from '../api'
import Icon from './Icon'

// אורחים לא יכולים לפרסם או לערוך מודעות. הניסיון מוביל לכאן.
export default function GuestWall() {
  return (
    <div className="card narrow">
      <div className="authbox center">
        <span className="bigico"><Icon n="lock" size={30} /></span>
        <h2>צריך חשבון כדי להמשיך</h2>
        <p>כאורחים אפשר לדפדף ולנסות את האתר, אבל לא לפרסם דירה. כדי לפרסם מודעה אמיתית צריך להירשם. זה חינם ולוקח דקה.</p>
        <button className="btn primary big" onClick={() => exitGuest('/login?mode=signup')}>הרשמה</button>
        <button className="btn soft" onClick={() => exitGuest('/login')}>כבר יש לי חשבון</button>
        <Link to="/" className="linkbtn">חזרה לאתר</Link>
      </div>
    </div>
  )
}
