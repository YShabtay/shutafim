import { createClient } from '@supabase/supabase-js'
import { compressImage } from './image'

let client
const get = () => (client ??= createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY))
const sb = new Proxy({}, { get: (_, k) => get()[k] })
const ok = ({ data, error }) => { if (error) throw error; return data }

async function uploadPhoto(uid, file, max) {
  const blob = await compressImage(file, max)
  const path = `${uid}/${crypto.randomUUID()}.jpg`
  ok(await sb.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' }))
  return sb.storage.from('photos').getPublicUrl(path).data.publicUrl
}
const profilesByIds = async ids => {
  if (!ids.length) return {}
  const rows = ok(await sb.from('profiles').select('*').in('user_id', ids))
  return Object.fromEntries(rows.map(r => [r.user_id, r]))
}

export const api = {
  mode: 'supabase',
  async getUser() { return (await sb.auth.getUser()).data.user },
  onAuth(cb) {
    sb.auth.getSession().then(({ data }) => cb(data.session?.user ?? null))
    const { data } = sb.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') window.dispatchEvent(new Event('shutafim:recovery'))
      cb(s?.user ?? null)
    })
    return () => data.subscription.unsubscribe()
  },
  async signUp(email, password, meta) {
    const { error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin, data: meta } })
    if (error) throw error
  },
  async usernameAvailable(name) {
    const { data, error } = await sb.rpc('username_available', { p: name })
    return error ? true : data !== false // אם הבדיקה לא זמינה, ממשיכים. השרת בודק שוב בהרשמה
  },
  // identifier: אימייל או שם משתמש
  async signInPassword(identifier, password) {
    let email = identifier
    if (!identifier.includes('@')) {
      const { data, error } = await sb.rpc('email_for_login', { p_username: identifier, p_password: password })
      if (error || !data) throw new Error('Invalid login credentials')
      email = data
    }
    const { error } = await sb.auth.signInWithPassword({ email, password })
    if (error) throw error
  },
  async resendConfirmation(email) {
    const { error } = await sb.auth.resend({ type: 'signup', email, options: { emailRedirectTo: location.origin } })
    if (error) throw error
  },
  async resetPassword(email) {
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin })
    if (error) throw error
  },
  async updatePassword(password) {
    const { error } = await sb.auth.updateUser({ password })
    if (error) throw error
  },
  async signOut() { await sb.auth.signOut() },

  // ---- פרופילים ----
  async getProfile(uid) { return ok(await sb.from('profiles').select('*').eq('user_id', uid).maybeSingle()) },
  async saveProfile(data, file) {
    const u = await this.getUser()
    const photo = file ? await uploadPhoto(u.id, file, 400) : data.photo || null
    const row = { ...data, photo, user_id: u.id, updated_at: new Date().toISOString() }
    return ok(await sb.from('profiles').upsert(row).select().single())
  },

  // ---- פוסטים ----
  async listPosts() { return ok(await sb.from('posts').select('*').eq('status', 'active').order('created_at', { ascending: false })) },
  async getPost(id) { return ok(await sb.from('posts').select('*').eq('id', id).maybeSingle()) },
  async getSocial(id) { const d = ok(await sb.from('post_contacts').select('social').eq('post_id', id).maybeSingle()); return d?.social },
  async myPosts() {
    const u = await this.getUser()
    const posts = ok(await sb.from('posts').select('*').eq('owner_id', u.id).order('created_at', { ascending: false })) || []
    const pend = ok(await sb.from('applications').select('post_id').eq('owner_id', u.id).eq('status', 'pending')) || []
    return posts.map(p => ({ ...p, pending: pend.filter(a => a.post_id === p.id).length }))
  },
  async createPost({ social, ...data }, files) {
    const u = await this.getUser()
    const photos = []
    for (const f of files) photos.push(await uploadPhoto(u.id, f, 1280))
    const post = ok(await sb.from('posts').insert({ ...data, owner_id: u.id, photos }).select().single())
    if (social) ok(await sb.from('post_contacts').insert({ post_id: post.id, social }))
    return post
  },
  async setStatus(id, status) { await sb.from('posts').update({ status }).eq('id', id) },
  async deletePost(id) { await sb.from('posts').delete().eq('id', id) },

  // ---- בקשות ----
  async apply(postId, message) {
    const u = await this.getUser()
    const post = ok(await sb.from('posts').select('owner_id').eq('id', postId).single())
    const { error } = await sb.from('applications').insert({ post_id: postId, owner_id: post.owner_id, applicant_id: u.id, message })
    if (error) throw new Error(error.code === '23505' ? 'כבר הגשת בקשה לדירה הזו' : error.message)
  },
  async getMyApplication(postId) {
    const u = await this.getUser()
    const a = ok(await sb.from('applications').select('*').eq('post_id', postId).eq('applicant_id', u.id).maybeSingle())
    if (!a) return null
    const c = ok(await sb.from('conversations').select('id').eq('post_id', postId).eq('seeker_id', u.id).maybeSingle())
    return { ...a, conversation_id: c?.id }
  },
  async listIncoming(postId) {
    const apps = ok(await sb.from('applications').select('*').eq('post_id', postId).order('created_at', { ascending: false })) || []
    const profs = await profilesByIds(apps.map(a => a.applicant_id))
    const convs = ok(await sb.from('conversations').select('id, seeker_id').eq('post_id', postId)) || []
    return apps.map(a => ({ ...a, profile: profs[a.applicant_id] || null, conversation_id: convs.find(c => c.seeker_id === a.applicant_id)?.id }))
  },
  async listAllIncoming() {
    const u = await this.getUser()
    const apps = ok(await sb.from('applications').select('*, posts(*)').eq('owner_id', u.id).order('created_at', { ascending: false })) || []
    const profs = await profilesByIds([...new Set(apps.map(a => a.applicant_id))])
    const convs = ok(await sb.from('conversations').select('id, post_id, seeker_id').eq('owner_id', u.id)) || []
    return apps.map(a => ({ ...a, post: a.posts, profile: profs[a.applicant_id] || null, conversation_id: convs.find(c => c.post_id === a.post_id && c.seeker_id === a.applicant_id)?.id }))
  },
  async listMyApplications() {
    const u = await this.getUser()
    const apps = ok(await sb.from('applications').select('*, posts(title, city)').eq('applicant_id', u.id).order('created_at', { ascending: false })) || []
    const convs = ok(await sb.from('conversations').select('id, post_id').eq('seeker_id', u.id)) || []
    return apps.map(a => ({ ...a, title: a.posts?.title || '', city: a.posts?.city || '', conversation_id: convs.find(c => c.post_id === a.post_id)?.id }))
  },
  async setApplicationStatus(id, status) {
    const a = ok(await sb.from('applications').update({ status }).eq('id', id).select().single())
    if (status === 'declined') return
    let conv = ok(await sb.from('conversations').select('*').eq('post_id', a.post_id).eq('seeker_id', a.applicant_id).maybeSingle())
    if (!conv) {
      conv = ok(await sb.from('conversations').insert({ post_id: a.post_id, owner_id: a.owner_id, seeker_id: a.applicant_id }).select().single())
      await sb.from('messages').insert({ conversation_id: conv.id, sender_id: a.owner_id, body: 'היי! ראיתי את הבקשה שלך ואשמח להכיר. בוא/י נדבר.' })
    }
    if (status === 'accepted') {
      await sb.from('messages').insert({ conversation_id: conv.id, sender_id: a.owner_id, body: 'מזל טוב, אושרת כשותף/ה לדירה!' })
      await sb.from('posts').update({ status: 'taken' }).eq('id', a.post_id) // הדירה עוברת לארכיון ונעלמת מהחיפוש
    }
    return conv
  },

  // ---- צ'אט ----
  async listConversations() {
    const u = await this.getUser()
    const data = ok(await sb.from('conversations').select('*, posts(title)')) || []
    const ids = data.map(c => c.id)
    const profs = await profilesByIds(data.map(c => (c.owner_id === u.id ? c.seeker_id : c.owner_id)))
    const msgs = ids.length ? ok(await sb.from('messages').select('id, conversation_id, body, sender_id, created_at').in('conversation_id', ids).order('created_at', { ascending: false }).limit(300)) || [] : []
    return data.map(c => ({
      ...c, title: c.posts?.title || '', role: c.owner_id === u.id ? 'owner' : 'seeker',
      other: profs[c.owner_id === u.id ? c.seeker_id : c.owner_id] || null, last: msgs.find(m => m.conversation_id === c.id) || null,
    })).sort((a, b) => (b.last?.created_at || b.created_at).localeCompare(a.last?.created_at || a.created_at))
  },
  async getConversation(id) {
    const u = await this.getUser()
    const c = ok(await sb.from('conversations').select('*, posts(title)').eq('id', id).maybeSingle())
    if (!c) return null
    const other = await this.getProfile(c.owner_id === u.id ? c.seeker_id : c.owner_id)
    const application = ok(await sb.from('applications').select('id, status').eq('post_id', c.post_id).eq('applicant_id', c.seeker_id).maybeSingle())
    return { ...c, title: c.posts?.title || '', role: c.owner_id === u.id ? 'owner' : 'seeker', other, application }
  },
  async listMessages(cid) { return ok(await sb.from('messages').select('*').eq('conversation_id', cid).order('created_at')) || [] },
  async sendMessage(cid, body) {
    const u = await this.getUser()
    ok(await sb.from('messages').insert({ conversation_id: cid, sender_id: u.id, body }))
  },
  debugRealtime(onStatus, onEvent) {
    const ch = sb.channel('dbg-' + Math.random().toString(36).slice(2)).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, onEvent).subscribe(onStatus)
    return () => sb.removeChannel(ch)
  },
  subscribeAllMessages(cb) {
    const ch = sb.channel('allmsgs-' + Math.random().toString(36).slice(2)).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, cb).subscribe()
    const t = setInterval(cb, 15000) // גיבוי למקרה שהחיבור בזמן אמת נפל
    return () => { clearInterval(t); sb.removeChannel(ch) }
  },
  subscribe(cid, cb) {
    const ch = sb.channel('msgs-' + cid)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${cid}` },
        () => this.listMessages(cid).then(cb)).subscribe()
    return () => sb.removeChannel(ch)
  },

  // ---- התראות ----
  async listNotifications() { return ok(await sb.from('notifications').select('*').order('created_at', { ascending: false }).limit(30)) || [] },
  async markNotificationRead(id) { await sb.from('notifications').update({ read: true }).eq('id', id) },
  async markAllNotificationsRead() {
    const u = await this.getUser()
    await sb.from('notifications').update({ read: true }).eq('user_id', u.id).eq('read', false)
  },
  async markConversationRead(cid) {
    const u = await this.getUser()
    await sb.from('notifications').update({ read: true }).eq('user_id', u.id).eq('kind', 'message').eq('conversation_id', cid).eq('read', false)
  },
  subscribeNotifications(cb) {
    const ch = sb.channel('notifs-' + Math.random().toString(36).slice(2)).on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, cb).subscribe()
    const t = setInterval(cb, 30000) // גיבוי למקרה שהחיבור בזמן אמת נפל
    return () => { clearInterval(t); sb.removeChannel(ch) }
  },
}
