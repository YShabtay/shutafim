import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom'
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
import MessagesMenu from './components/MessagesMenu'
import { Toast, useNotifications } from './components/notifications'
import { isComplete } from './match'
import Login from './components/Login'
import ResetPassword from './pages/ResetPassword'
import Legal from './pages/Legal'
import Logo from './components/Logo'
import Icon from './components/Icon'

export default function App() {
  const [user, setUser] = useState(undefined)
  const [profile, setProfile] = useState(undefined)
  const nav = useNavigate()
  const notifs = useNotifications(!!user)
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')
  const toggleTheme = () => {
    const t = theme === 'dark' ? 'light' : 'dark'
    setTheme(t)
    document.documentElement.dataset.theme = t
    try { localStorage.setItem('shutafim_theme', t) } catch {}
  }
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
        <Link to="/" className="logo"><Logo />שותפים</Link>
        <nav>
          <button className="themebtn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'מצב בהיר' : 'מצב כהה'} title={theme === 'dark' ? 'מצב בהיר' : 'מצב כהה'}>
            <Icon n={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
          {user === null && <>
            <button className="btn ghost" onClick={() => nav('/login')}>התחברות</button>
            <button className="btn primary" onClick={() => nav('/login?mode=signup')}>הרשמה</button>
          </>}
          {user && <>
            <MessagesMenu notifs={notifs} />
            <Bell notifs={notifs} />
            <button className="btn dark" onClick={() => nav('/new')}><Icon n="plus" size={16} />פרסום דירה</button>
            <UserMenu profile={profile} canSignOut={api.mode === 'supabase'} onSignOut={() => api.signOut()} />
          </>}
        </nav>
      </header>
      {user && <Toast notifs={notifs} />}
      {isGuest ? (
        <div className="demo">מצב אורח: הכול נשמר רק בדפדפן שלכם ואף אחד אחר לא רואה את זה. <button className="linkbtn" onClick={exitGuest}>יציאה ממצב אורח</button></div>
      ) : api.mode === 'demo' ? (
        <div className="demo">מצב דמו – הנתונים נשמרים בדפדפן שלך בלבד. חברו Supabase כדי לעלות לאוויר (ראו README).</div>
      ) : user === null && hasBackend ? (
        <div className="demo">רוצים רק להציץ? <button className="linkbtn" onClick={enterGuest}>נסו את האתר בלי להירשם</button></div>
      ) : null}
      <main>
        <Routes>
          <Route path="/" element={<Feed profile={profile} />} />
          <Route path="/post/:id" element={<PostPage user={user} profile={profile} />} />
          <Route path="/new" element={user === undefined || (user && profile === undefined) ? null : !user ? <Login /> : isComplete(profile) ? <NewPost /> : <Navigate to="/profile?next=/new" replace />} />
          <Route path="/inbox" element={user === undefined ? null : user ? <Inbox /> : <Login />} />
          <Route path="/chat/:id" element={user === undefined ? null : user ? <Chat user={user} /> : <Login />} />
          <Route path="/login" element={user === undefined ? null : user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/reset" element={user ? <ResetPassword /> : <Login />} />
          <Route path="/legal/:doc" element={<Legal />} />
          <Route path="/profile" element={user === undefined || (user && profile === undefined) ? null : user ? <Profile profile={profile} onSaved={setProfile} /> : <Login />} />
          <Route path="/post/:id/requests" element={user === undefined ? null : user ? <Requests /> : <Login />} />
          <Route path="/mine" element={user ? <MyPosts /> : <Login />} />
        </Routes>
      </main>
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
