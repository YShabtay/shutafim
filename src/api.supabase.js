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
    const { data } = sb.auth.onAuthStateChange((_e, s) => cb(s?.user ?? null))
    return () => data.subscription.unsubscribe()
  },
  async signIn(email) {
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin } })
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
  async listMyApplications() {
    const u = await this.getUser()
    const apps = ok(await sb.from('applications').select('*, posts(title, city)').eq('applicant_id', u.id).order('created_at', { ascending: false })) || []
    const convs = ok(await sb.from('conversations').select('id, post_id').eq('seeker_id', u.id)) || []
    return apps.map(a => ({ ...a, title: a.posts?.title || '', city: a.posts?.city || '', conversation_id: convs.find(c => c.post_id === a.post_id)?.id }))
  },
  async setApplicationStatus(id, status) {
    const a = ok(await sb.from('applications').update({ status }).eq('id', id).select().single())
    if (status !== 'accepted') return
    const ex = ok(await sb.from('conversations').select('*').eq('post_id', a.post_id).eq('seeker_id', a.applicant_id).maybeSingle())
    if (ex) return ex
    return ok(await sb.from('conversations').insert({ post_id: a.post_id, owner_id: a.owner_id, seeker_id: a.applicant_id }).select().single())
  },

  // ---- צ'אט ----
  async listConversations() {
    const u = await this.getUser()
    const data = ok(await sb.from('conversations').select('*, posts(title)').order('created_at', { ascending: false })) || []
    return data.map(c => ({ ...c, title: c.posts?.title || '', role: c.owner_id === u.id ? 'owner' : 'seeker' }))
  },
  async getConversation(id) {
    const u = await this.getUser()
    const c = ok(await sb.from('conversations').select('*, posts(title)').eq('id', id).maybeSingle())
    if (!c) return null
    const other = await this.getProfile(c.owner_id === u.id ? c.seeker_id : c.owner_id)
    return { ...c, title: c.posts?.title || '', role: c.owner_id === u.id ? 'owner' : 'seeker', other }
  },
  async listMessages(cid) { return ok(await sb.from('messages').select('*').eq('conversation_id', cid).order('created_at')) || [] },
  async sendMessage(cid, body) {
    const u = await this.getUser()
    ok(await sb.from('messages').insert({ conversation_id: cid, sender_id: u.id, body }))
  },
  subscribe(cid, cb) {
    const ch = sb.channel('msgs-' + cid)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${cid}` },
        () => this.listMessages(cid).then(cb)).subscribe()
    return () => sb.removeChannel(ch)
  },
}
