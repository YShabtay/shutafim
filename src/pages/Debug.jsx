import { useEffect, useState } from 'react'
import { api } from '../api'
import { getSeen } from '../seen'

// עמוד אבחון: מראה מה האתר רואה אצל המשתמש המחובר (שיחות, התראות, חיבור בזמן אמת)
export default function Debug() {
  const [r, setR] = useState({ steps: [] })
  const [rt, setRt] = useState({ status: 'מתחבר…', events: 0, last: '' })

  useEffect(() => {
    const steps = []
    const step = async (name, fn) => {
      try { steps.push({ name, ok: true, info: await fn() }) } catch (e) { steps.push({ name, ok: false, info: e.message || String(e) }) }
      setR({ steps: [...steps] })
    }
    ;(async () => {
      let me
      await step('משתמש מחובר', async () => { me = await api.getUser(); return me ? `id ${me.id}` : 'אין משתמש מחובר' })
      if (!me) return
      await step('פרופיל', async () => { const p = await api.getProfile(me.id); return p ? `${p.first_name}, גיל ${p.age}, שם משתמש ${p.username || '-'}` : 'אין פרופיל' })
      await step('שיחות', async () => {
        const c = await api.listConversations()
        const seen = getSeen(me.id)
        return `${c.length} שיחות\n` + c.map(v => `• ${v.title || v.id} | מול ${v.other?.first_name || '?'} | אחרונה: ${v.last ? `${v.last.sender_id === me.id ? 'ממני' : 'מהצד השני'} ב-${v.last.created_at}` : 'אין הודעות'} | נראתה עד: ${seen[v.id] || 'אף פעם'} | ${v.last && v.last.sender_id !== me.id && v.last.created_at > (seen[v.id] || '') ? 'לא נקראה' : 'נקראה'}`).join('\n')
      })
      await step('התראות', async () => { const n = await api.listNotifications(); const by = {}; n.forEach(x => { by[x.kind] = (by[x.kind] || 0) + 1 }); return `${n.length} התראות ${JSON.stringify(by)}` })
    })()
    const off = api.debugRealtime?.(
      s => setRt(x => ({ ...x, status: String(s) })),
      p => setRt(x => ({ ...x, events: x.events + 1, last: new Date().toLocaleTimeString('he-IL') })),
    )
    return () => off?.()
  }, [])

  return (
    <div className="narrow wide">
      <h2>אבחון</h2>
      <p className="meta">שלחו צילום מסך של העמוד הזה. הוא לא מציג סיסמאות.</p>
      {r.steps.map(s => (
        <div key={s.name} className="card" style={{ marginTop: 12 }}>
          <b>{s.ok ? '✅' : '❌'} {s.name}</b>
          <pre style={{ whiteSpace: 'pre-wrap', margin: '8px 0 0', fontFamily: 'inherit', fontSize: 13, direction: 'rtl' }}>{s.info}</pre>
        </div>
      ))}
      <div className="card" style={{ marginTop: 12 }}>
        <b>חיבור בזמן אמת (הודעות)</b>
        <p style={{ margin: '8px 0 0' }}>סטטוס: <b dir="ltr">{rt.status}</b> · אירועים שהתקבלו: <b>{rt.events}</b>{rt.last && ` · אחרון ב-${rt.last}`}</p>
        <p className="meta">השאירו את העמוד פתוח ושלחו הודעה מהמשתמש השני. המספר אמור לעלות.</p>
      </div>
    </div>
  )
}
