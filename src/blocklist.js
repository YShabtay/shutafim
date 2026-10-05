// סינון שמות משתמש פוגעניים. הבדיקה גם מנרמלת תחבולות נפוצות (0=o, 1=i, אותיות חוזרות וכו').
const norm = s => s.toLowerCase()
  .replace(/[ךםןףץ]/g, c => ({ ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }[c]))
  .replace(/[@4]/g, 'a').replace(/[0]/g, 'o').replace(/[1!|]/g, 'i').replace(/[3]/g, 'e').replace(/[5$]/g, 's')
  .replace(/[^a-zא-ת]/g, '')
  .replace(/(.)\1+/g, '$1')

// מילים ארוכות: נפסלות גם כחלק משם. קצרות: רק כשהשם כולו שווה להן.
const CONTAINS = ['fuck', 'fock', 'fuk', 'fck', 'phuck', 'shit', 'bitch', 'cunt', 'pussy', 'asshole', 'bastard', 'nigg', 'niga', 'slut', 'whore', 'nazi', 'hitler', 'porn', 'rapist',
  'זונה', 'שרמוט', 'מניאק', 'כוסעמק', 'כוסאמק', 'מזדיינ', 'תזדיינ', 'בנזונה'].map(norm)
const EXACT = ['dick', 'cock', 'ass', 'fag', 'sex', 'חרא', 'זינ', 'כוס', 'תחת', 'מנהל', 'אדמינ', 'admin', 'root', 'support', 'shutafim', 'moderator', 'תמיכה', 'שותפים'].map(norm)

export const isProfane = name => {
  const n = norm(name)
  return EXACT.includes(n) || CONTAINS.some(w => n.includes(w))
}

export function usernameError(u) {
  if (!u) return ''
  if (u.length < 3 || u.length > 20) return 'שם משתמש: 3 עד 20 תווים'
  if (!/^[A-Za-z0-9_א-ת]+$/.test(u)) return 'אותיות, ספרות וקו תחתון בלבד'
  if (isProfane(u)) return 'שם המשתמש אינו מתאים. בחרו שם אחר'
  return ''
}
