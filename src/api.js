import { api as local } from './api.local'
import { api as remote } from './api.supabase'

// יש backend אמיתי כשמוגדרים משתני Supabase. מצב אורח עובד מעליו על נתוני דמו בדפדפן בלבד.
const GUEST_KEY = 'shutafim_guest'
export const hasBackend = !!import.meta.env.VITE_SUPABASE_URL
const readGuest = () => { try { return localStorage.getItem(GUEST_KEY) === '1' } catch { return false } }

export const isGuest = hasBackend && readGuest()
export const api = hasBackend && !isGuest ? remote : local

export function enterGuest() { try { localStorage.setItem(GUEST_KEY, '1') } catch {} location.assign('/') }
export function exitGuest() { try { localStorage.removeItem(GUEST_KEY) } catch {} location.assign('/') }
