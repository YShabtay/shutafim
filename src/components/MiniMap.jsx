import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// מפה קטנה בעמוד הפוסט: אזור משוער בלבד (עיגול), לא כתובת מדויקת
export default function MiniMap({ point }) {
  const el = useRef()
  useEffect(() => {
    const m = L.map(el.current, { scrollWheelZoom: false }).setView(point, 14)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(m)
    L.circle(point, { radius: 350, color: '#2f6bff', weight: 2, fillColor: '#2f6bff', fillOpacity: 0.18 }).addTo(m)
    return () => m.remove()
  }, [point[0], point[1]])
  return <div ref={el} className="minimap" />
}
