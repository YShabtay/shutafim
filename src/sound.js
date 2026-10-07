// צליל התראה קצר שנוצר בדפדפן (בלי קובץ). בטלפון הוא נשמע רק אם המכשיר לא על שקט, כי הדפדפן מכבד את מתג השקט.
// הערה: דפדפנים מאפשרים צליל רק אחרי שהמשתמש לחץ על משהו באתר פעם אחת, ולכן מפעילים את השמע בלחיצה הראשונה.
const KEY = 'shutafim_sound'
let ctx
export const stats = { played: 0 }

export const isSoundOn = () => { try { return localStorage.getItem(KEY) !== 'off' } catch { return true } }
export const setSoundOn = on => { try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch {} }

export function unlockAudio() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return
  ctx = ctx || new AC()
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
}

// kind: 'message' (שני צלילים עולים) | 'notif' (צליל אחד רך)
export function playDing(kind = 'message') {
  if (!isSoundOn()) return
  try { navigator.vibrate?.(kind === 'message' ? [60, 40, 60] : 70) } catch {}
  if (!ctx || ctx.state !== 'running') return
  const notes = kind === 'message' ? [[880, 0], [1318, 0.13]] : [[1046, 0]]
  const t0 = ctx.currentTime
  for (const [freq, delay] of notes) {
    const osc = ctx.createOscillator(), gain = ctx.createGain()
    osc.type = 'sine'; osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, t0 + delay)
    gain.gain.exponentialRampToValueAtTime(0.22, t0 + delay + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + 0.42)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t0 + delay); osc.stop(t0 + delay + 0.45)
  }
  stats.played++
}
