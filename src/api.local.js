// מצב דמו: הכול נשמר ב-localStorage. אנשים אחרים הם דמויות לדוגמה.
import { compressImage, blobToDataUrl } from './image'

const KEY = 'shutafim_posts_v3', CK = 'shutafim_convs', MK = 'shutafim_msgs', AK = 'shutafim_apps', PK = 'shutafim_profile'
const USER = { id: 'demo', email: 'demo@local' }
const iso = (daysAgo = 0) => new Date(Date.now() - 86400000 * daysAgo).toISOString()

const person = (user_id, first_name, age, gender, occupation, extra = {}) => ({
  user_id, first_name, age, gender, occupation, smoking: 'no', has_pet: false, cleanliness: 'normal',
  sleep: 'flexible', guests: 'sometimes', kosher: false, bio: '', photo: '', ...extra,
})
const PEOPLE = {
  u_noa: person('u_noa', 'נועה', 28, 'female', 'working', { cleanliness: 'tidy', bio: 'מעצבת גרפית, אוהבת בישולים וערבים רגועים בבית.' }),
  u_maya: person('u_maya', 'מאיה', 24, 'female', 'student', { sleep: 'night', guests: 'often', bio: 'לומדת פסיכולוגיה, חברותית ואוהבת לארח.' }),
  u_ido: person('u_ido', 'עידו', 31, 'male', 'working', { has_pet: true, bio: 'מפתח תוכנה, עובד הרבה מהבית. חתול אחד, לא מזיק.' }),
  u_tal: person('u_tal', 'טל', 23, 'male', 'student', { guests: 'often', bio: 'סטודנט להנדסה, אוהב כדורגל ומשחקי קופסה.' }),
  u_lior: person('u_lior', 'ליאור', 30, 'female', 'working', { cleanliness: 'tidy', sleep: 'early', bio: 'רופאת שיניים, קמה מוקדם ומחפשת שקט.' }),
  u_dana: person('u_dana', 'דנה', 26, 'female', 'working', { cleanliness: 'tidy', bio: 'עובדת בהייטק, אוהבת יוגה וקפה. מחפשת בית רגוע.' }),
  u_amit: person('u_amit', 'עמית', 27, 'male', 'student', { sleep: 'night', bio: 'סטודנט לתואר שני, שקט ואחראי.' }),
}

const base = { status: 'active', photos: [], social: '', pref_gender: 'any', pref_age_min: null, pref_age_max: null, pref_smoking: 'any', pref_pets: 'any', pref_kosher: false, pref_occupation: 'any' }
const seed = [
  { ...base, id: 's1', owner_id: 'u_noa', title: 'חדר מרווח בדירת 3 חדרים בפלורנטין', city: 'תל אביב', neighborhood: 'פלורנטין', rent: 3200, available_from: '2026-11-01', roommates_total: 3,
    description: 'דירה מוארת עם מרפסת, שותפים נעימים. מחפשים מישהו שקט ואחראי.', social: 'https://instagram.com/example_tlv',
    pref_age_min: 24, pref_age_max: 32, pref_smoking: 'no', pref_occupation: 'working', created_at: iso(0),
    roommates: [{ name: 'נועה', age: 28, occupation: 'מעצבת גרפית' }, { name: 'גיל', age: 30, occupation: 'מהנדס' }] },
  { ...base, id: 's2', owner_id: 'u_maya', title: 'שותפה לדירה ליד האוניברסיטה', city: 'ירושלים', neighborhood: 'גבעת רם', rent: 1900, available_from: '2026-10-20', roommates_total: 4,
    description: 'דירת סטודנטיות, אווירה טובה, קרוב לקמפוס.', pref_gender: 'female', pref_age_min: 20, pref_age_max: 28, pref_smoking: 'no', pref_pets: 'no', pref_kosher: true, pref_occupation: 'student', created_at: iso(0),
    roommates: [{ name: 'מאיה', age: 24, occupation: 'סטודנטית לפסיכולוגיה' }, { name: 'שירה', age: 23, occupation: 'סטודנטית לביולוגיה' }, { name: 'יעל', age: 25, occupation: 'סטודנטית למשפטים' }] },
  { ...base, id: 's3', owner_id: 'u_ido', title: 'סטודיו משותף עם נוף לים, מחפשים שותף/ה רגועים', city: 'חיפה', neighborhood: 'הדר', rent: 2100, available_from: '2026-11-15', roommates_total: 2,
    description: 'דירה שקטה עם מרפסת גדולה. אוהבים בישולים משותפים וערבי משחקי קופסה.', pref_age_min: 25, pref_age_max: 38, pref_smoking: 'no', pref_pets: 'yes', pref_occupation: 'working', created_at: iso(2),
    roommates: [{ name: 'עידו', age: 31, occupation: 'מפתח תוכנה' }] },
  { ...base, id: 's4', owner_id: 'u_tal', title: 'חדר בדירת סטודנטים בבאר שבע, קרוב לאוניברסיטה', city: 'באר שבע', neighborhood: 'שכונה ד׳', rent: 1300, available_from: '2026-10-25', roommates_total: 4,
    description: 'דירה גדולה ומשופצת, שלושה שותפים חברותיים. חוויה סטודנטיאלית אמיתית.', pref_age_min: 20, pref_age_max: 30, pref_occupation: 'student', created_at: iso(5),
    roommates: [{ name: 'טל', age: 23, occupation: 'סטודנט להנדסה' }, { name: 'אורי', age: 24, occupation: 'סטודנט לכלכלה' }, { name: 'נדב', age: 22, occupation: 'סטודנט למדעי המחשב' }] },
  { ...base, id: 's5', owner_id: 'u_lior', title: 'שותפה לדירה מעוצבת ברמת גן', city: 'רמת גן', neighborhood: 'בורסה', rent: 2900, available_from: '2026-12-01', roommates_total: 2, social: 'https://instagram.com/example_rg',
    description: 'דירת 3 חדרים מעוצבת, קרובה לרכבת. מחפשת שותפה מסודרת ופתוחה.', pref_gender: 'female', pref_age_min: 26, pref_age_max: 35, pref_smoking: 'no', pref_pets: 'no', pref_occupation: 'working', created_at: iso(1),
    roommates: [{ name: 'ליאור', age: 30, occupation: 'רופאת שיניים' }] },
]

const read = k => { try { return JSON.parse(localStorage.getItem(k)) || [] } catch { return [] } }
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v))
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || seed } catch { return seed } }
const save = p => write(KEY, p)
const myProfile = () => { try { return JSON.parse(localStorage.getItem(PK)) } catch { return null } }
const profileOf = uid => (uid === USER.id ? myProfile() : PEOPLE[uid] || null)

function addMsg(conversation_id, sender_id, body) {
  write(MK, [...read(MK), { id: crypto.randomUUID(), conversation_id, sender_id, body, created_at: new Date().toISOString() }])
}
function openConversation(post_id, owner_id, seeker_id, firstFrom, firstText) {
  const convs = read(CK)
  let c = convs.find(x => x.post_id === post_id && x.seeker_id === seeker_id)
  if (!c) {
    c = { id: crypto.randomUUID(), post_id, owner_id, seeker_id, created_at: new Date().toISOString() }
    write(CK, [...convs, c])
    if (firstText) addMsg(c.id, firstFrom, firstText)
  }
  return c
}
const convFor = (post_id, seeker_id) => read(CK).find(x => x.post_id === post_id && x.seeker_id === seeker_id)
const withTitle = c => ({ ...c, title: load().find(p => p.id === c.post_id)?.title || '', role: c.owner_id === USER.id ? 'owner' : 'seeker' })

export const api = {
  mode: 'demo',
  async getUser() { return USER },
  onAuth(cb) { cb(USER); return () => {} },
  async signIn() {}, async signOut() {},

  // ---- פרופילים ----
  async getProfile(uid) { return profileOf(uid) },
  async saveProfile(data, file) {
    const photo = file ? await blobToDataUrl(await compressImage(file, 400)) : data.photo || ''
    const pr = { ...data, photo, user_id: USER.id }
    localStorage.setItem(PK, JSON.stringify(pr)); return pr
  },

  // ---- פוסטים ----
  async listPosts() { return load().filter(p => p.status === 'active').sort((a, b) => b.created_at.localeCompare(a.created_at)) },
  async getPost(id) { return load().find(p => p.id === id) || null },
  async getSocial(id) { return load().find(p => p.id === id)?.social },
  async myPosts() {
    const pending = read(AK).filter(a => a.owner_id === USER.id && a.status === 'pending')
    return load().filter(p => p.owner_id === USER.id).map(p => ({ ...p, pending: pending.filter(a => a.post_id === p.id).length }))
  },
  async createPost(data, files) {
    const photos = await Promise.all(files.map(async f => blobToDataUrl(await compressImage(f, 900))))
    const post = { ...data, id: crypto.randomUUID(), owner_id: USER.id, photos, status: 'active', created_at: new Date().toISOString() }
    save([post, ...load()])
    // דמו: שני מתעניינים לדוגמה מגישים בקשה לדירה החדשה
    write(AK, [...read(AK),
      { id: crypto.randomUUID(), post_id: post.id, owner_id: USER.id, applicant_id: 'u_dana', message: 'היי! ראיתי את הדירה ונשמע לי מושלם. אני שקטה ומסודרת, אשמח להכיר.', status: 'pending', created_at: iso(0) },
      { id: crypto.randomUUID(), post_id: post.id, owner_id: USER.id, applicant_id: 'u_amit', message: 'שלום, סטודנט לתואר שני, מחפש דירה רגועה ליד האוניברסיטה.', status: 'pending', created_at: iso(0) }])
    return post
  },
  async setStatus(id, status) { save(load().map(p => (p.id === id ? { ...p, status } : p))) },
  async deletePost(id) { save(load().filter(p => p.id !== id)) },

  // ---- בקשות ----
  async apply(postId, message) {
    const post = load().find(p => p.id === postId)
    if (read(AK).some(a => a.post_id === postId && a.applicant_id === USER.id)) throw new Error('כבר הגשת בקשה לדירה הזו')
    const app = { id: crypto.randomUUID(), post_id: postId, owner_id: post.owner_id, applicant_id: USER.id, message, status: 'pending', created_at: new Date().toISOString() }
    write(AK, [...read(AK), app])
    // דמו: בעל הדירה מאשר אחרי כמה שניות כדי שתוכלו לראות את הזרימה
    setTimeout(() => {
      write(AK, read(AK).map(a => (a.id === app.id ? { ...a, status: 'accepted' } : a)))
      openConversation(postId, post.owner_id, USER.id, post.owner_id, 'היי! אישרתי את הבקשה שלך. נשמח להכיר, מתי נוח לך לבוא לראות את הדירה?')
    }, 4000)
    return app
  },
  async getMyApplication(postId) {
    const a = read(AK).find(x => x.post_id === postId && x.applicant_id === USER.id)
    return a ? { ...a, conversation_id: convFor(postId, USER.id)?.id } : null
  },
  async listIncoming(postId) {
    return read(AK).filter(a => a.post_id === postId && a.owner_id === USER.id)
      .map(a => ({ ...a, profile: profileOf(a.applicant_id), conversation_id: convFor(postId, a.applicant_id)?.id }))
  },
  async listMyApplications() {
    const posts = load()
    return read(AK).filter(a => a.applicant_id === USER.id).map(a => {
      const p = posts.find(x => x.id === a.post_id)
      return { ...a, title: p?.title || '', city: p?.city || '', conversation_id: convFor(a.post_id, USER.id)?.id }
    })
  },
  async setApplicationStatus(id, status) {
    const apps = read(AK); const a = apps.find(x => x.id === id)
    write(AK, apps.map(x => (x.id === id ? { ...x, status } : x)))
    if (status === 'accepted') {
      return openConversation(a.post_id, a.owner_id, a.applicant_id, a.applicant_id, 'תודה שאישרת! אשמח לתאם ביקור בדירה.')
    }
  },

  // ---- צ'אט (דמו: הצד השני עונה אוטומטית) ----
  async listConversations() { return read(CK).filter(c => [c.owner_id, c.seeker_id].includes(USER.id)).map(withTitle) },
  async getConversation(id) {
    const c = read(CK).find(x => x.id === id); if (!c) return null
    return { ...withTitle(c), other: profileOf(c.owner_id === USER.id ? c.seeker_id : c.owner_id) }
  },
  async listMessages(cid) { return read(MK).filter(m => m.conversation_id === cid) },
  async sendMessage(cid, body) {
    addMsg(cid, USER.id, body)
    const c = read(CK).find(x => x.id === cid)
    const other = c.owner_id === USER.id ? c.seeker_id : c.owner_id
    setTimeout(() => addMsg(cid, other, 'תודה על ההודעה! (תשובה אוטומטית של מצב הדמו)'), 1200)
  },
  subscribe(cid, cb) { const t = setInterval(() => this.listMessages(cid).then(cb), 1000); return () => clearInterval(t) },
}
