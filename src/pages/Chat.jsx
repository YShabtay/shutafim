import { useNavigate, useParams } from 'react-router-dom'
import { ChatWindow } from '../components/ChatDock'

// שיחה כעמוד מלא (בנייד, וכשפותחים קישור ישיר לשיחה)
export default function Chat() {
  const { id } = useParams()
  const nav = useNavigate()
  return <div className="chatpage"><ChatWindow key={id} cid={id} page min={false} onClose={() => nav('/inbox?tab=chats')} onToggle={() => {}} /></div>
}
