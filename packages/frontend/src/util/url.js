const pad2 = (n) => String(n).padStart(2, '0')
const DATE_RE = /^(\d{2})_(\d{2})_(\d{4})$/

export const encodeDateToURL = (value) => {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d)) return null
  const dd = pad2(d.getDate())
  const mm = pad2(d.getMonth() + 1)
  const yyyy = d.getFullYear()
  return `${dd}_${mm}_${yyyy}`
}

export const decodeDateFromURL = (s) => {
  if (!s || typeof s !== 'string') return null
  const m = DATE_RE.exec(s.trim())
  if (!m) return null
  const [, dd, mm, yyyy] = m
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  return isNaN(d) ? null : d
}

export const urlToISODateString = (s) => {
  const d = decodeDateFromURL(s)
  return d ? d.toISOString() : null
}

export const isoDateStringToURL = (iso) => {
  if (!iso) return null
  const d = new Date(iso)
  return encodeDateToURL(d)
}
