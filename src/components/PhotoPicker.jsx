import { useEffect, useMemo, useRef, useState } from 'react'
import { prepareImage } from '../image'
import Icon from './Icon'

// בחירת תמונות מודרנית: אזור העלאה עם גרירה, תצוגה מקדימה והסרה. keep = תמונות שכבר שמורות (בעריכה), files = חדשות.
export default function PhotoPicker({ keep, onKeepChange, files, onFilesChange, max = 6, onError }) {
  const input = useRef()
  const [over, setOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const total = keep.length + files.length
  const previews = useMemo(() => files.map(f => URL.createObjectURL(f)), [files])
  useEffect(() => () => previews.forEach(u => URL.revokeObjectURL(u)), [previews])

  const add = async list => {
    onError('')
    const imgs = [...list].filter(f => f.type.startsWith('image/') || /\.hei[cf]$/i.test(f.name))
    if (!imgs.length) return
    const room = max - total
    if (room <= 0) return onError(`אפשר להעלות עד ${max} תמונות`)
    setBusy(true)
    try {
      const ready = await Promise.all(imgs.slice(0, room).map(prepareImage))
      onFilesChange([...files, ...ready])
      if (imgs.length > room) onError(`אפשר להעלות עד ${max} תמונות, ${imgs.length - room} לא נוספו`)
    } catch { onError('לא הצלחנו לקרוא אחת התמונות. נסו תמונה אחרת.') }
    setBusy(false)
  }
  const all = [...keep.map(u => ({ key: u, src: u, remove: () => onKeepChange(keep.filter(x => x !== u)) })),
    ...files.map((f, i) => ({ key: 'n' + i + f.name, src: previews[i], remove: () => onFilesChange(files.filter((_, j) => j !== i)) }))]

  return (
    <div className="photopicker">
      <button type="button" className={'dropzone' + (over ? ' over' : '')} disabled={total >= max}
        onClick={() => input.current.click()}
        onDragOver={e => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)}
        onDrop={e => { e.preventDefault(); setOver(false); add(e.dataTransfer.files) }}>
        <span className="dzico"><Icon n="image" size={26} /></span>
        <b>{busy ? 'מעבד תמונות…' : total >= max ? 'הגעתם למקסימום תמונות' : 'גררו תמונות לכאן או לחצו להעלאה'}</b>
        <small>{total} מתוך {max} תמונות · JPG, PNG או תמונה מהאייפון</small>
      </button>
      <input ref={input} type="file" accept="image/*,.heic,.heif" multiple hidden onChange={e => { add(e.target.files); e.target.value = '' }} />
      {all.length > 0 && (
        <div className="photogrid">
          {all.map((p, i) => (
            <div key={p.key} className="phth">
              <img src={p.src} alt="" />
              {i === 0 && <span className="phmain">ראשית</span>}
              <button type="button" aria-label="הסר תמונה" onClick={p.remove}><Icon n="x" size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
