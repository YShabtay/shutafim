export const GENDER = { any: 'לא משנה', male: 'גברים', female: 'נשים' }
export const YESNO = { any: 'לא משנה', no: 'לא', yes: 'כן' }
export const OCC = { any: 'לא משנה', student: 'סטודנט/ית', working: 'עובד/ת' }
export const GENDER_SELF = { male: 'גבר', female: 'אישה', other: 'אחר' }
export const CLEAN = { relaxed: 'רגוע/ה בנושא ניקיון', normal: 'ניקיון סביר', tidy: 'מסודר/ת מאוד' }
export const SLEEP = { early: 'קם/ה מוקדם', flexible: 'שעות גמישות', night: 'ינשוף לילה' }
export const GUESTS = { rare: 'אורחים לעיתים רחוקות', sometimes: 'אורחים לפעמים', often: 'אוהב/ת אורחים' }

export function prefChips(p) {
  const c = []
  if (p.pref_gender !== 'any') c.push('שותפ/ה: ' + GENDER[p.pref_gender])
  if (p.pref_age_min || p.pref_age_max) c.push(`גיל ${p.pref_age_min || ''}–${p.pref_age_max || ''}`)
  if (p.pref_smoking !== 'any') c.push(p.pref_smoking === 'no' ? 'ללא עישון' : 'עישון מותר')
  if (p.pref_pets !== 'any') c.push(p.pref_pets === 'no' ? 'ללא חיות' : 'חיות בסדר')
  if (p.pref_kosher) c.push('שומרי כשרות')
  if (p.pref_occupation !== 'any') c.push(OCC[p.pref_occupation])
  return c
}

export function traitChips(p) {
  const c = [OCC[p.occupation], p.smoking === 'yes' ? 'מעשן/ת' : 'לא מעשן/ת']
  if (p.has_pet) c.push('יש חיית מחמד')
  c.push(CLEAN[p.cleanliness], SLEEP[p.sleep], GUESTS[p.guests])
  if (p.kosher) c.push('שומר/ת כשרות')
  return c.filter(Boolean)
}

export const fmtDate = iso => (iso ? iso.split('-').reverse().join('.') : '')
export const entryText = p => (p.available_now ? 'כניסה מיידית' : p.available_from ? `כניסה ${fmtDate(p.available_from)}` : 'כניסה גמישה')
