import Icon from './Icon'
// שדה מספרי עם כפתורי + ו-− במקום החצים המובנים של הדפדפן
export default function NumberInput({ value, onChange, step = 1, min = 0, max = 1e9, placeholder, required, suffix }) {
  const num = value === '' || value == null ? null : +value
  const clamp = n => Math.min(max, Math.max(min, n))
  const bump = d => onChange(String(num == null ? clamp(Math.max(min, step)) : clamp(num + d * step)))
  return (
    <div className="num">
      <button type="button" tabIndex={-1} aria-label="הפחת" onClick={() => bump(-1)} disabled={num == null || num <= min}><Icon n="minus" size={15} /></button>
      <div className="numval">
        <input inputMode="numeric" value={value ?? ''} placeholder={placeholder} required={required}
          onChange={e => onChange(e.target.value.replace(/\D/g, ''))} />
        {suffix && num != null && <span>{suffix}</span>}
      </div>
      <button type="button" tabIndex={-1} aria-label="הוסף" onClick={() => bump(1)} disabled={num != null && num >= max}><Icon n="plus" size={15} /></button>
    </div>
  )
}
