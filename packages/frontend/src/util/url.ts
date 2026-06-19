const pad2 = (n: number): string => String(n).padStart(2, '0')
const DATE_RE = /^(\d{2})_(\d{2})_(\d{4})$/

export const encodeDateToURL = (value: Date | string | number | null | undefined): string | null => {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return null
  const dd = pad2(d.getDate())
  const mm = pad2(d.getMonth() + 1)
  const yyyy = d.getFullYear()
  return `${dd}_${mm}_${yyyy}`
}

export const decodeDateFromURL = (s: string | null | undefined): Date | null => {
  if (!s || typeof s !== 'string') return null
  const m = DATE_RE.exec(s.trim())
  if (!m) return null
  const [, dd, mm, yyyy] = m
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  return isNaN(d.getTime()) ? null : d
}

export const urlToISODateString = (s: string | null | undefined): string | null => {
  const d = decodeDateFromURL(s)
  return d ? d.toISOString() : null
}

export const isoDateStringToURL = (iso: string | null | undefined): string | null => {
  if (!iso) return null
  const d = new Date(iso)
  return encodeDateToURL(d)
}
