import { useEffect, useState } from 'react'
const K = 'shutafim_favs'
const read = () => { try { return JSON.parse(localStorage.getItem(K)) || [] } catch { return [] } }
export function useFavs() {
  const [favs, setFavs] = useState(read)
  useEffect(() => { try { localStorage.setItem(K, JSON.stringify(favs)) } catch {} }, [favs])
  const toggle = id => setFavs(f => (f.includes(id) ? f.filter(x => x !== id) : [...f, id]))
  return [favs, toggle]
}
