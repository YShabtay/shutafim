// איור רך נייטרלי לדירות בלי תמונה
export function tintFor() { return ['var(--soft)', 'var(--mute)'] }
export default function Placeholder({ className = '' }) {
  return (
    <div className={'plh ' + className}>
      <svg viewBox="0 0 120 90" width="46%" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".7">
        <path d="M10 44L60 10l50 34" /><path d="M20 38v44h80V38" /><rect x="34" y="50" width="18" height="16" rx="3" /><rect x="68" y="50" width="18" height="16" rx="3" />
      </svg>
    </div>
  )
}
