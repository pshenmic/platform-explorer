export type ListScrollMode = 'continuous' | 'pages'

const PREFIX = 'pe:list-scroll-v2:'

export function readListScrollMode(
  key: string,
  fallback: ListScrollMode = 'pages'
): ListScrollMode {
  if (typeof window === 'undefined') return fallback
  try {
    const value = window.localStorage.getItem(`${PREFIX}${key}`)
    if (value === 'pages' || value === 'continuous') return value
  } catch {
    /* ignore */
  }
  return fallback
}

export function writeListScrollMode(key: string, mode: ListScrollMode) {
  try {
    window.localStorage.setItem(`${PREFIX}${key}`, mode)
  } catch {
    /* ignore */
  }
}
