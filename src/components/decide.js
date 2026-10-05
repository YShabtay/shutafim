import { api } from '../api'
import { flash } from './flash'

export const CHAT_WELCOME = 'היי! ראיתי את הבקשה שלך ואשמח להכיר. בוא/י נדבר.'
export const ACCEPT_MSG = 'מזל טוב, אושרת כשותף/ה לדירה!'
export const STATUS = { pending: 'ממתינה', chatting: 'בשיחה', accepted: 'אושרה', declined: 'נדחתה', withdrawn: 'בוטלה' }

// פעולת בעל הדירה על בקשה: chatting (פותח שיחה, לא מאשר) | accepted (אישור סופי) | declined
export async function decide(a, status, { openChat, reload } = {}) {
  const who = a.profile?.first_name || a.applicantName || 'המבקש/ת'
  if (status === 'accepted' && !window.confirm(`לאשר את ${who} כשותף/ה לדירה? זו ההחלטה הסופית.`)) return null
  const conv = await api.setApplicationStatus(a.id, status)
  if (status === 'chatting') flash(`נפתחה שיחה עם ${who}`)
  else if (status === 'accepted') flash(`אישרת את ${who} כשותף/ה לדירה`)
  else flash(`הבקשה של ${who} נדחתה`, 'no')
  await reload?.()
  if (status === 'chatting' && conv) openChat?.(conv.id)
  return conv
}
