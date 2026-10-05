// איור רך לדירות בלי תמונה
const TINTS = [['#e3efff', '#2f6fe0'], ['#ffe9e2', '#e0583d'], ['#e5f6ec', '#1f9d62'], ['#fff2d4', '#d98a00'], ['#efe8ff', '#7451e6'], ['#e2f5f6', '#0f8f9a']]
export function tintFor(key) {
  let h = 0
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return TINTS[h % TINTS.length]
}
export default function Placeholder({ id, className = '' }) {
  const [bg, fg] = tintFor(id)
  return (
    <div className={'plh ' + className} style={{ background: bg, color: fg }}>
      <svg viewBox="0 0 120 90" width="46%" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".85">
        <path d="M10 44L60 10l50 34" /><path d="M20 38v44h80V38" /><rect x="34" y="50" width="18" height="16" rx="3" /><rect x="68" y="50" width="18" height="16" rx="3" />
        <path d="M60 82V66" opacity="0" />
      </svg>
    </div>
  )
}
