type DateInput = string | number | Date

function getDaysBetweenDates (startDate: DateInput, endDate: DateInput): number {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffInMilliseconds = Math.abs(end.getTime() - start.getTime())
  const daysDifference = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24))
  return daysDifference
}

const getDynamicRange = (duration: number): { start: string, end: string } => {
  const now = new Date()
  const end = now.toISOString()
  const start = new Date(now.getTime() - duration).toISOString()
  return { start, end }
}

function getTimeDelta (startDate: DateInput, endDate: DateInput, format?: string): string {
  if (
    !startDate ||
    !endDate ||
    isNaN(new Date(startDate).getTime()) ||
    isNaN(new Date(endDate).getTime())
  ) {
    return 'n/a'
  }

  const diff = new Date(endDate).getTime() - new Date(startDate).getTime()
  const isFuture = diff > 0
  const absoluteDiff = Math.abs(diff)
  const days = Math.floor(absoluteDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(
    (absoluteDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  )
  const minutes = Math.floor((absoluteDiff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((absoluteDiff % (1000 * 60)) / 1000)

  if (!format || format === 'default') {
    const timeDirection = isFuture ? 'left' : 'ago'

    if (days > 0) {
      return `${days}d ${timeDirection}`
    } else if (hours > 0) {
      return `${hours}h ${timeDirection}`
    } else if (minutes > 0) {
      return `${minutes} min. ${timeDirection}`
    } else {
      return `${seconds} sec. ${timeDirection}`
    }
  }

  if (format === 'detailed') {
    return `${days}d:${hours}h:${minutes}m`
  }

  // dense lists: largest non-zero unit only; the full timestamp lives in the tooltip
  if (format === 'compact') {
    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return `${seconds}s`
  }

  return 'Invalid format'
}

const optionsDefault: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}

type DateOptionsTransform = (options: Intl.DateTimeFormatOptions) => Intl.DateTimeFormatOptions

export const formatDate = (
  timestamp: string | number,
  setOptions: DateOptionsTransform = (options) => options
): { formatted: string, date: Date } | null => {
  const validatedValue = isNaN(Number(timestamp)) ? timestamp : parseInt(String(timestamp))
  const date = new Date(validatedValue)

  if (String(date) === 'Invalid Date') return null

  const formatted = date.toLocaleDateString('en-GB', setOptions(optionsDefault))

  return { formatted, date }
}

export { getDaysBetweenDates, getDynamicRange, getTimeDelta }
