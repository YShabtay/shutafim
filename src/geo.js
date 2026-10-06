// מיקום משוער לדירה: מרכזי ערים כגיבוי לפוסטים בלי מיקום, והמרת כתובת לקואורדינטות
const CITIES = {
  'תל אביב': [32.0853, 34.7818], 'ירושלים': [31.7683, 35.2137], 'חיפה': [32.794, 34.9896], 'באר שבע': [31.253, 34.7915],
  'רמת גן': [32.0684, 34.8248], 'הרצליה': [32.1663, 34.8436], 'אריאל': [32.106, 35.173], 'פתח תקווה': [32.084, 34.8878],
  'נתניה': [32.3215, 34.8532], 'ראשון לציון': [31.973, 34.7925], 'אשדוד': [31.8044, 34.6553], 'חולון': [32.0158, 34.7874],
  'בת ים': [32.0231, 34.7503], 'רחובות': [31.8928, 34.8113], 'כפר סבא': [32.175, 34.9066], 'רעננה': [32.1848, 34.8713],
  'הוד השרון': [32.15, 34.8887], 'גבעתיים': [32.07, 34.81], 'בני ברק': [32.084, 34.8338], 'מודיעין': [31.8969, 35.0104],
  'אילת': [29.5577, 34.9519], 'טבריה': [32.7959, 35.531], 'עפולה': [32.6078, 35.2897], 'נצרת': [32.6996, 35.3035],
  'כרמיאל': [32.919, 35.295], 'עכו': [32.9281, 35.082], 'נהריה': [33.005, 35.098], 'לוד': [31.9515, 34.8955],
  'רמלה': [31.9293, 34.8667], 'אשקלון': [31.6688, 34.5743], 'קריית גת': [31.61, 34.7642], 'דימונה': [31.07, 35.0333],
  'קריית שמונה': [33.2074, 35.5693], 'צפת': [32.9646, 35.496], 'יבנה': [31.8781, 34.7396], 'נס ציונה': [31.9293, 34.7987],
}
export const hasPoint = p => typeof p.lat === 'number' && typeof p.lng === 'number'
const jitter = id => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return [((h % 1000) / 1000 - 0.5) * 0.024, (((h >> 10) % 1000) / 1000 - 0.5) * 0.024] }

// [lat, lng] של הפוסט, או מרכז העיר עם סטייה קלה כשאין מיקום, או null
export function postPoint(p) {
  if (hasPoint(p)) return [p.lat, p.lng]
  const c = CITIES[(p.city || '').trim()]
  if (!c) return null
  const [dy, dx] = jitter(p.id)
  return [c[0] + dy, c[1] + dx]
}
// עיגול ל-~100 מטר: שומרים מיקום משוער בלבד, לא כתובת מדויקת
export const roundPoint = v => (v === '' || v == null ? null : Math.round(+v * 1000) / 1000)

export const cityPoint = city => CITIES[(city || '').trim()] || null
const km = (a, b) => { const R = 6371, d = Math.PI / 180, dy = (b[0] - a[0]) * d, dx = (b[1] - a[1]) * d; const h = Math.sin(dy / 2) ** 2 + Math.cos(a[0] * d) * Math.cos(b[0] * d) * Math.sin(dx / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)) }

// מיקום לפי עיר ושכונה: שכונה מתקבלת רק אם היא קרובה לעיר, אחרת מרכז העיר. כך שמות עמומים לא נוחתים במקום לא נכון.
export async function locate(city, neighborhood) {
  const c = cityPoint(city)
  if ((neighborhood || '').trim()) {
    const r = await geocode(`${neighborhood}, ${city}`)
    if (r && (!c || km(r, c) < 25)) return r
  }
  return c || (await geocode(city))
}

export async function geocode(query) {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=il&accept-language=he&q=${encodeURIComponent(query)}`)
    const j = await r.json()
    return j[0] ? [+j[0].lat, +j[0].lon] : null
  } catch { return null }
}
