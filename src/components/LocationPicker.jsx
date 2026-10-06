import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { locate } from '../geo'
import { addBaseMap, pinIcon } from '../mapTiles'

// בחירת מיקום משוער בטופס הפרסום: מוצאים לפי עיר ושכונה, אפשר ללחוץ או לגרור כדי לתקן
export default function LocationPicker({ city, neighborhood, lat, lng, onChange }) {
  const el = useRef(), map = useRef(), marker = useRef(), touched = useRef(lat !== '' && lat != null)
  const [msg, setMsg] = useState('')
  const cb = useRef(onChange); cb.current = onChange

  const place = (ll, zoom) => {
    if (!marker.current) {
      marker.current = L.marker(ll, { draggable: true, icon: pinIcon() }).addTo(map.current)
      marker.current.on('dragend', () => { touched.current = true; const p = marker.current.getLatLng(); cb.current(p.lat, p.lng) })
    } else marker.current.setLatLng(ll)
    if (zoom) map.current.setView(ll, zoom)
    cb.current(ll[0] ?? ll.lat, ll[1] ?? ll.lng)
  }
  useEffect(() => {
    const has = lat !== '' && lat != null
    map.current = L.map(el.current).setView(has ? [lat, lng] : [31.9, 34.95], has ? 15 : 7)
    const stopTheme = addBaseMap(map.current)
    if (has) place([lat, lng])
    map.current.on('click', e => { touched.current = true; place(e.latlng) })
    return () => { stopTheme(); map.current.remove() }
  }, [])
  const find = async () => {
    setMsg('מחפש…')
    const r = await locate(city, neighborhood)
    if (r) { place(r, 15); setMsg('') } else setMsg('לא מצאנו את המיקום. לחצו על המפה כדי לסמן.')
  }
  useEffect(() => { // מיקום אוטומטי לפי העיר והשכונה, כל עוד לא סימנתם ידנית
    if (touched.current || (city || '').trim().length < 2) return
    const t = setTimeout(find, 1000); return () => clearTimeout(t)
  }, [city, neighborhood])
  return (
    <div className="locpick">
      <div ref={el} className="locmap" />
      <div className="locbar"><button type="button" className="btn soft" onClick={() => { touched.current = false; find() }}>מצאו לפי העיר והשכונה</button><span className="meta">{msg || 'אפשר ללחוץ על המפה או לגרור את הסמן'}</span></div>
    </div>
  )
}
