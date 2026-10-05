// לוגו: גג אחד, שני אנשים תחתיו
export default function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--brand)" />
      <path d="M6.5 14.5L16 6.5l9.5 8" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="18" r="2.3" fill="#fff" /><path d="M8.2 26a3.8 3.8 0 0 1 7.6 0z" fill="#fff" />
      <circle cx="20" cy="18" r="2.3" fill="#fff" opacity=".85" /><path d="M16.2 26a3.8 3.8 0 0 1 7.6 0z" fill="#fff" opacity=".85" />
    </svg>
  )
}
