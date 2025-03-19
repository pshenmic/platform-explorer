function getDaysBetweenDates (startDate, endDate) {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffInMilliseconds = Math.abs(end - start)
  const daysDifference = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24))
  return daysDifference
}

const getDynamicRange = (duration) => {
  const now = new Date()
  const end = now.toISOString()
  const start = new Date(now - duration).toISOString()
  return { start, end }
}

function getTimeDelta (startDate, endDate, format) {
  if (!startDate || !endDate || isNaN(new Date(startDate)) || isNaN(new Date(endDate))) return 'n/a'

  const diff = new Date(endDate) - new Date(startDate)
  const isFuture = diff > 0
  const absoluteDiff = Math.abs(diff)
  const days = Math.floor(absoluteDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((absoluteDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
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

  return 'Invalid format'
}

export {
  getDaysBetweenDates,
  getDynamicRange,
  getTimeDelta
}
