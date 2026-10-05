// תמונות מאייפון נשמרות לעיתים כ-HEIC, ש-Chrome לא יודע להציג. ממירים ל-JPEG לפני הכול.
export async function prepareImage(file) {
  const isHeic = /hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name)
  if (!isHeic) return file
  const { default: heic2any } = await import('heic2any')
  const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 })
  const blob = Array.isArray(out) ? out[0] : out
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
}

// מכווץ תמונה בדפדפן כדי לחסוך מקום באחסון החינמי
export async function compressImage(input, max = 1280, quality = 0.8) {
  const file = await prepareImage(input)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      c.toBlob(b => (b ? resolve(b) : reject(new Error('compress failed'))), 'image/jpeg', quality)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
export const blobToDataUrl = b =>
  new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b) })
