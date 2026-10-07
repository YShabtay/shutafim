import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { api, hasBackend, isGuest, enterGuest, exitGuest } from './api'
import Feed from './pages/Feed'
import PostPage from './pages/PostPage'
import NewPost from './pages/NewPost'
import MyPosts from './pages/MyPosts'
import Inbox from './pages/Inbox'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Requests from './pages/Requests'
import UserMenu from './components/UserMenu'
import Bell from './components/Bell'
import BottomBar from './components/BottomBar'
import Notifications from './pages/Notifications'
import Account from './pages/Account'
import Admin from './pages/Admin'
import MessagesMenu from './components/MessagesMenu'
import { MessageToast, Toast, useNotifications } from './components/notifications'
import { useConversations } from './components/useConversations'
import { FlashHost } from './components/flash'
import { ConfirmHost } from './components/confirm'
import { ReportHost } from './components/report'
import { isComplete } from './match'
import Login from './components/Login'
import GuestWall from './components/GuestWall'
import ResetPassword from './pages/ResetPassword'
import Legal from './pages/Legal'
import Debug from './pages/Debug'
import EditPost from './pages/EditPost'
import Logo from './components/Logo'
import Icon from './components/Icon'

export default function App() {
  const [user, setUser] = useState(undefined)
  const [profile, setProfile] = useState(undefined)
  const nav = useNavigate()
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname]) // כל מעבר לדף חדש מתחיל מלמעלה
  const notifs = useNotifications(!!user)
  const msgs = useConversations(user?.id)
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => { if (user) api.isAdmin().then(setIsAdmin).catch(() => setIsAdmin(false)); else setIsAdmin(false) }, [user?.id])
  const totalUnread = notifs.requests.length + notifs.list.filter(n => !n.read && (n.kind === 'accepted' || n.kind === 'declined' || n.kind === 'chatting')).length + msgs.unread.size
  useEffect(() => { document.title = (totalUnread ? `(${totalUnread}) ` : '') + 'שותפים – מצאו שותפים לדירה' }, [totalUnread])
  useEffect(() => api.onAuth(setUser), [])
  useEffect(() => { const h = () => nav('/reset'); window.addEventListener('shutafim:recovery', h); return () => window.removeEventListener('shutafim:recovery', h) }, [])
  useEffect(() => {
    if (user === undefined) return
    if (!user) { setProfile(null); return }
    api.getProfile(user.id).then(p => setProfile(p || null))
  }, [user?.id])
  return (
    <>
      <header className="top">
        <Link to="/" className="logo"><Logo /><span className="logotxt">שותפים</span></Link>
        <div className="topactions">
          <nav className={'mainnav ' + (user ? 'in' : 'out')}>
            {user === null && <>
              <button className="btn ghost" onClick={() => nav('/login')}>התחברות</button>
              <button className="btn primary" onClick={() => nav('/login?mode=signup')}>הרשמה</button>
            </>}
            {user && <>
              <MessagesMenu msgs={msgs} />
              <Bell notifs={notifs} />
              <button className="btn dark newpost" aria-label="פרסום דירה" onClick={() => nav('/new')}><Icon n="plus" size={16} /><span className="lbl">פרסום דירה</span></button>
              <UserMenu isAdmin={isAdmin} pending={notifs.requests.length} profile={profile} canSignOut={api.mode === 'supabase'} onSignOut={() => api.signOut()} />
            </>}
          </nav>
        </div>
      </header>
      <FlashHost />
      <ConfirmHost />
      <ReportHost />
      {user && <Toast notifs={notifs} />}
      {user && <MessageToast msgs={msgs} userId={user.id} />}
      {isGuest ? (
        <div className="demo">מצב אורח: אפשר לדפדף ולנסות את האתר, אבל לא לפרסם מודעות או לדווח. <button className="linkbtn" onClick={() => exitGuest('/login?mode=signup')}>הרשמה בחינם</button></div>
      ) : api.mode === 'demo' ? (
        <div className="demo">מצב דמו – הנתונים נשמרים בדפדפן שלך בלבד. חברו Supabase כדי לעלות לאוויר (ראו README).</div>
      ) : user === null && hasBackend ? (
        <div className="demo">רוצים רק להציץ? <button className="linkbtn" onClick={enterGuest}>נסו את האתר בלי להירשם</button></div>
      ) : null}
      <main>
        <Routes>
          <Route path="/" element={<Feed profile={profile} userId={user?.id} pending={notifs.requests.length} />} />
          <Route path="/post/:id" element={<PostPage user={user} profile={profile} />} />
          <Route path="/new" element={isGuest ? <GuestWall /> : user === undefined || (user && profile === undefined) ? null : !user ? <Login /> : isComplete(profile) ? <NewPost /> : <Navigate to="/profile?next=/new" replace />} />
          <Route path="/inbox" element={user === undefined ? null : user ? <Inbox /> : <Login />} />
          <Route path="/chat/:id" element={user === undefined ? null : user ? <Chat /> : <Login />} />
          <Route path="/notifications" element={user === undefined ? null : user ? <Notifications notifs={notifs} /> : <Login />} />
          <Route path="/account" element={user === undefined || (user && profile === undefined) ? null : user ? <Account isAdmin={isAdmin} profile={profile} pending={notifs.requests.length} /> : <Login />} />
          <Route path="/login" element={user === undefined ? null : user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/reset" element={user ? <ResetPassword /> : <Login />} />
          <Route path="/admin" element={user === undefined ? null : user ? <Admin /> : <Login />} />
          <Route path="/debug" element={user === undefined ? null : user ? <Debug /> : <Login />} />
          <Route path="/legal/:doc" element={<Legal />} />
          <Route path="/profile" element={user === undefined || (user && profile === undefined) ? null : user ? <Profile profile={profile} onSaved={setProfile} /> : <Login />} />
          <Route path="/post/:id/edit" element={isGuest ? <GuestWall /> : user === undefined ? null : user ? <EditPost /> : <Login />} />
          <Route path="/post/:id/requests" element={user === undefined ? null : user ? <Requests /> : <Login />} />
          <Route path="/mine" element={user ? <MyPosts /> : <Login />} />
        </Routes>
      </main>
      {user && <BottomBar msgBadge={msgs.unread.size} notifBadge={notifs.requests.length + notifs.list.filter(n => !n.read && (n.kind === 'accepted' || n.kind === 'declined' || n.kind === 'chatting')).length} />}
      <footer>
        <div className="disclaimer">
          <Icon n="shield" size={20} />
          <div>
            <b>שימו לב לפני שמעבירים כסף</b>
            <p>האתר נועד ליצירת קשר בין שותפים בלבד, ואין בו אפשרות להעברת כספים. את התיאום הכספי (שכר דירה, פיקדון ועוד) הצדדים מסדירים ביניהם, מחוץ לאתר. בעל הדירה אינו צד באתר ואינו קשור אליו. אל תעבירו כסף לפני שראיתם את הדירה ופגשתם את השותפים.</p>
          </div>
        </div>
        <div className="legal">חינמי לגמרי · הפרסום באחריות המפרסמים · <Link to="/legal/terms">תנאי שימוש</Link> · <Link to="/legal/privacy">מדיניות פרטיות</Link></div>
      </footer>
    </>
  )
}
