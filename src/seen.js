// איזו הודעה אחרונה כל משתמש כבר ראה בכל שיחה (נשמר בדפדפן, לכל משתמש בנפרד)
const key = uid => 'shutafim_seen_' + uid
const read = uid => { try { return JSON.parse(localStorage.getItem(key(uid))) || {} } catch { return {} } }
export const getSeen = uid => read(uid)
export function markSeen(uid, cid, ts) {
  if (!uid || !ts) return
  const s = read(uid)
  if (s[cid] && s[cid] >= ts) return
  s[cid] = ts
  try { localStorage.setItem(key(uid), JSON.stringify(s)) } catch {}
  window.dispatchEvent(new Event('shutafim:seen'))
}
