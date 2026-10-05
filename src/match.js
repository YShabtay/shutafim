// מדד התאמה בין הפרופיל של המחפש לקריטריונים של הפוסט
export const hasProfile = f => f.gender !== 'any' || f.smoking !== 'any' || f.pets !== 'any' || f.occ !== 'any' || !!f.age

export function matchScore(p, f) {
  const checks = []
  if (f.gender !== 'any') checks.push(p.pref_gender === 'any' || p.pref_gender === f.gender)
  if (f.smoking !== 'any') checks.push(!(f.smoking === 'yes' && p.pref_smoking === 'no') && !(f.smoking === 'no' && p.pref_smoking === 'yes'))
  if (f.pets !== 'any') checks.push(!(f.pets === 'yes' && p.pref_pets === 'no') && !(f.pets === 'no' && p.pref_pets === 'yes'))
  if (f.occ !== 'any') checks.push(p.pref_occupation === 'any' || p.pref_occupation === f.occ)
  if (f.age) {
    const a = +f.age
    checks.push((!p.pref_age_min || a >= p.pref_age_min) && (!p.pref_age_max || a <= p.pref_age_max))
  }
  if (!checks.length) return null
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

export const isNew = p => Date.now() - new Date(p.created_at).getTime() < 3 * 86400000

// המרת פרופיל משתמש לאובייקט סינון (לחישוב אחוז התאמה)
export const profileToFilter = pr => ({
  gender: pr.gender === 'other' ? 'any' : pr.gender,
  smoking: pr.smoking, pets: pr.has_pet ? 'yes' : 'no', occ: pr.occupation, age: pr.age ? String(pr.age) : '',
})
export const isComplete = pr => !!(pr && pr.first_name && pr.age && pr.gender && pr.occupation)
