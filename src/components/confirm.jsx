import { useEffect, useState } from 'react'

// חלון אישור מתוך האתר, במקום החלון של הדפדפן. שימוש: if (await askConfirm({ title, text, confirmLabel, danger })) { ... }
export const askConfirm = opts => new Promise(resolve => window.dispatchEvent(new CustomEvent('shutafim:confirm', { detail: { ...opts, resolve } })))

export function ConfirmHost() {
  const [item, setItem] = useState(null)
  useEffect(() => {
    const open = e => setItem(e.detail)
    window.addEventListener('shutafim:confirm', open)
    return () => window.removeEventListener('shutafim:confirm', open)
  }, [])
  useEffect(() => {
    if (!item) return
    const key = e => { if (e.key === 'Escape') close(false) }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [item])
  const close = ok => { item.resolve(ok); setItem(null) }
  if (!item) return null
  return (
    <div className="modalback" onMouseDown={e => { if (e.target === e.currentTarget) close(false) }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h3 id="modal-title">{item.title}</h3>
        {item.text && <p>{item.text}</p>}
        <div className="modalbtns">
          <button className="btn ghost" onClick={() => close(false)}>{item.cancelLabel || 'ביטול'}</button>
          <button className={'btn ' + (item.danger ? 'danger' : 'primary')} autoFocus onClick={() => close(true)}>{item.confirmLabel || 'אישור'}</button>
        </div>
      </div>
    </div>
  )
}
