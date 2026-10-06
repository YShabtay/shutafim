import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// מפת דירות: כל דירה כבועת מחיר עם עיגול אזור משוער. לחיצה פותחת כרטיס קטן.
export default function MapView({ items, onOpen, onSearchArea }) {
  const el = useRef(), map = useRef(), group = useRef(), fitted = useRef(false)
  useEffect(() => {
    map.current = L.map(el.current, { zoomControl: true }).setView([31.9, 34.95], 8)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(map.current)
    group.current = L.layerGroup().addTo(map.current)
    return () => map.current.remove()
  }, [])
  useEffect(() => {
    group.current.clearLayers()
    const pts = []
    for (const { p, point } of items) {
      pts.push(point)
      L.circle(point, { radius: 300, color: '#2f6bff', weight: 1, fillColor: '#2f6bff', fillOpacity: 0.12 }).addTo(group.current)
      const m = L.marker(point, { icon: L.divIcon({ className: 'pricepin', html: `<span>₪${p.rent.toLocaleString()}</span>`, iconSize: [64, 28], iconAnchor: [32, 14] }) }).addTo(group.current)
      const box = document.createElement('div'); box.className = 'mappop'
      const t = document.createElement('b'); t.textContent = p.title
      const s = document.createElement('span'); s.textContent = `${p.city}${p.neighborhood ? ' · ' + p.neighborhood : ''} · ₪${p.rent.toLocaleString()}`
      const b = document.createElement('button'); b.textContent = 'לפוסט'; b.onclick = () => onOpen(p.id)
      box.append(t, s, b); m.bindPopup(box)
    }
    if (pts.length && !fitted.current) { map.current.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 13 }); fitted.current = true }
  }, [items])
  return (
    <div className="mapbox">
      <div ref={el} className="mapcanvas" />
      <button className="maparea" onClick={() => { const b = map.current.getBounds(); onSearchArea({ s: b.getSouth(), n: b.getNorth(), w: b.getWest(), e: b.getEast() }) }}>חיפוש באזור הזה</button>
    </div>
  )
}
