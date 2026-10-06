import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const brand = () => getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#2f6bff'

// מפה קטנה בעמוד הפוסט: אזור משוער בלבד (עיגול), לא כתובת מדויקת
export default function MiniMap({ point }) {
  const el = useRef()
  useEffect(() => {
    const m = L.map(el.current, { scrollWheelZoom: false }).setView(point, 14)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(m)
    L.circle(point, { radius: 350, color: brand(), weight: 2, fillColor: brand(), fillOpacity: 0.18 }).addTo(m)
    return () => m.remove()
  }, [point[0], point[1]])
  return <div ref={el} className="minimap" />
}
