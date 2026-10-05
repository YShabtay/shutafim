import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useChatDock } from './ChatDock'
import { ago } from './notifications'
import Avatar from './Avatar'
import Icon from './Icon'

// אייקון הודעות בכותרת, כמו במסנג'ר: רשימת השיחות, ולחיצה פותחת חלון צ'אט בפינה
export default function MessagesMenu({ notifs }) {
  const { openChat } = useChatDock()
  const [open, setOpen] = useState(false)
  const [convs, setConvs] = useState(null)
  const wrap = useRef()
  const unreadConvs = new Set(notifs.list.filter(n => n.kind === 'message' && !n.read).map(n => n.conversation_id))
  const stamp = notifs.list.filter(n => n.kind === 'message').map(n => n.id + n.created_at).join()
  const refresh = () => api.listConversations().then(setConvs).catch(() => setConvs([]))
  useEffect(() => { if (open) refresh() }, [open, stamp])
  useEffect(() => {
    const close = e => { if (!wrap.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close)
  }, [])
  return (
    <div className="bell" ref={wrap}>
      <button className="themebtn" aria-label={unreadConvs.size ? `${unreadConvs.size} שיחות עם הודעות חדשות` : 'הודעות'} aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Icon n="chat" size={18} />
        {unreadConvs.size > 0 && <i className="bellbadge">{unreadConvs.size > 9 ? '9+' : unreadConvs.size}</i>}
      </button>
      {open && (
        <div className="belldrop">
          <div className="bellhead"><b>הודעות</b><Link to="/inbox?tab=chats" onClick={() => setOpen(false)}>לכל ההודעות</Link></div>
          {convs === null && <p className="meta bellempty">טוען…</p>}
          {convs?.length === 0 && <p className="meta bellempty">אין שיחות עדיין. שיחה נפתחת אחרי שבקשה אושרה.</p>}
          <div className="belllist">
            {convs?.map(c => (
              <button key={c.id} className={'bellitem convitem' + (unreadConvs.has(c.id) ? ' unread' : '')} onClick={() => { setOpen(false); openChat(c.id) }}>
                <Avatar profile={c.other || { first_name: '?' }} size={40} />
                <span className="belltext">
                  <b>{c.other?.first_name || 'משתמש'}</b>
                  <span className="preview">{c.last ? c.last.body : c.title}</span>
                  <small>{c.title}{c.last && ` · ${ago(c.last.created_at)}`}</small>
                </span>
                {unreadConvs.has(c.id) && <i className="udot2" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
