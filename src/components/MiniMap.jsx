import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { addBaseMap } from '../mapTiles'

const brand = () => getComputedStyle(document.documentElement).getPropertyValue('--mapc').trim() || '#14182b'

// מפה קטנה בעמוד הפוסט: אזור משוער בלבד (עיגול), לא כתובת מדויקת
export default function MiniMap({ point }) {
  const el = useRef()
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const m = L.map(el.current, { scrollWheelZoom: false }).setView(point, 14)
    const stopTheme = addBaseMap(m, () => setTick(t => t + 1))
    L.circle(point, { radius: 350, color: brand(), weight: 2, fillColor: brand(), fillOpacity: 0.18 }).addTo(m)
    return () => { stopTheme(); m.remove() }
  }, [point[0], point[1], tick])
  return <div ref={el} className="minimap" />
}
