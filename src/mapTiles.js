import L from 'leaflet'

// מפת OpenStreetMap (עם שמות בעברית) בלי מפתח, מרוככת בעיבוד צבע כדי שתיראה נקייה. במצב כהה הצבעים מתהפכים (ראו styles.css).
const URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTR = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

export function addBaseMap(map, onThemeChange) {
  L.tileLayer(URL, { maxZoom: 19, attribution: ATTR }).addTo(map)
  // העיבוד נעשה ב-CSS, אז רק מציירים מחדש את העיגולים כשמצב התצוגה מתחלף
  const mo = new MutationObserver(() => onThemeChange?.())
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => mo.disconnect()
}

// סמן מיקום משלנו (במקום האייקון המובנה של הספרייה, שנשבר בבנייה)
export const pinIcon = () => L.divIcon({
  className: 'locpin',
  html: '<svg width="34" height="44" viewBox="0 0 34 44"><path d="M17 43C17 43 3 28 3 17a14 14 0 0 1 28 0c0 11-14 26-14 26z" fill="currentColor"/><circle cx="17" cy="17" r="5.5" fill="var(--bg)"/></svg>',
  iconSize: [34, 44], iconAnchor: [17, 42],
})
