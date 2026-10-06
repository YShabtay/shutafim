import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { addBaseMap } from '../mapTiles'
import Icon from './Icon'

const brand = () => getComputedStyle(document.documentElement).getPropertyValue('--mapc').trim() || '#14182b'

// מפת דירות עם סרגל חיפוש על המפה: כותבים עיר והמפה עוברת אליה, וגוררים כדי לראות אזור אחר.
// כל תזוזה של המפה מעדכנת את התוצאות לאזור שרואים (onAreaChange).
export default function MapView({ items, onOpen, onAreaChange, query = '', focusPoints = [], fallback = null, rawQuery = '', onQuery, names = [], emptyHere = false }) {
  const el = useRef(), map = useRef(), group = useRef(), fitted = useRef(false), lastKey = useRef(null)
  const areaCb = useRef(onAreaChange); areaCb.current = onAreaChange
  const itemsRef = useRef(items); itemsRef.current = items
  const focusRef = useRef(focusPoints); focusRef.current = focusPoints
  const [tick, setTick] = useState(0) // מצב תצוגה השתנה: מציירים מחדש את העיגולים בצבע המתאים
  const [focus, setFocus] = useState(false)

  useEffect(() => {
    map.current = L.map(el.current, { zoomControl: true }).setView([31.9, 34.95], 8)
    const stopTheme = addBaseMap(map.current, () => setTick(t => t + 1))
    group.current = L.layerGroup().addTo(map.current)
    let t
    // כל תזוזה (גרירה, זום או מעבר לעיר) מעדכנת את האזור הנראה
    map.current.on('moveend', () => {
      clearTimeout(t)
      t = setTimeout(() => { const b = map.current.getBounds(); areaCb.current?.({ s: b.getSouth(), n: b.getNorth(), w: b.getWest(), e: b.getEast() }) }, 250)
    })
    return () => { clearTimeout(t); stopTheme(); map.current.remove() }
  }, [])

  // סמנים
  useEffect(() => {
    group.current.clearLayers()
    for (const { p, point } of items) {
      L.circle(point, { radius: 300, color: brand(), weight: 1, fillColor: brand(), fillOpacity: 0.12 }).addTo(group.current)
      const m = L.marker(point, { icon: L.divIcon({ className: 'pricepin', html: `<span>₪${p.rent.toLocaleString()}</span>`, iconSize: [64, 28], iconAnchor: [32, 14] }) }).addTo(group.current)
      const box = document.createElement('div'); box.className = 'mappop'
      const t = document.createElement('b'); t.textContent = p.title
      const s = document.createElement('span'); s.textContent = `${p.city}${p.neighborhood ? ' · ' + p.neighborhood : ''} · ₪${p.rent.toLocaleString()}`
      const b = document.createElement('button'); b.textContent = 'לפוסט'; b.onclick = () => onOpen(p.id)
      box.append(t, s, b); m.bindPopup(box)
    }
  }, [items, tick])

  // מעבר המפה כשהחיפוש משתנה: לדירות שנמצאו, ואם אין, למרכז העיר. בלי חיפוש: כל הדירות.
  useEffect(() => {
    const key = query || ''
    if (lastKey.current === key && fitted.current) return
    const pts = key ? focusRef.current : itemsRef.current.map(i => i.point)
    if (pts.length) {
      map.current.fitBounds(L.latLngBounds(pts), { padding: [60, 60], maxZoom: key ? 14 : 13 })
      lastKey.current = key; fitted.current = true
    } else if (key && fallback) {
      map.current.setView(fallback, 12)
      lastKey.current = key; fitted.current = true
    }
  }, [query, fallback, focusPoints.length, items.length])

  const q = rawQuery.trim()
  const suggestions = q ? names.filter(n => n.includes(q) && n !== q).slice(0, 6) : []
  return (
    <div className="mapbox">
      <div ref={el} className="mapcanvas" />
      <div className="mapsearch">
        <Icon n="search" size={18} />
        <input value={rawQuery} placeholder="חיפוש עיר או שכונה במפה" aria-label="חיפוש עיר או שכונה במפה"
          onChange={e => onQuery(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)}
          onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }} />
        {rawQuery && <button aria-label="ניקוי" onClick={() => onQuery('')}><Icon n="x" size={15} /></button>}
        {focus && suggestions.length > 0 && (
          <ul className="mapsug">{suggestions.map(n => <li key={n}><button onMouseDown={e => e.preventDefault()} onClick={() => { onQuery(n); setFocus(false) }}><Icon n="pin" size={15} /> {n}</button></li>)}</ul>
        )}
      </div>
      {emptyHere && <div className="mapempty">אין דירות באזור הזה עדיין</div>}
    </div>
  )
}
