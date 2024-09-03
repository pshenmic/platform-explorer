import copyToClipboard from './copyToClipboard'
import { StateTransitionEnum, TransactionTypesEnum } from '../enums/state.transition.type'
import currencyRound from './currencyRound'

const getTransitionTypeString = (id) => {
  const [stateTransitionType] = Object.entries(StateTransitionEnum)
    .filter(([key]) => StateTransitionEnum[key] === id)
    .map(([key]) => key)

  return TransactionTypesEnum[stateTransitionType] ?? 'UNKNOWN'
}

function fetchHandlerSuccess (setter, data) {
  setter(state => ({
    ...state,
    data: {
      ...state.data,
      ...data
    },
    loading: false,
    error: false
  }))
}

function fetchHandlerError (setter, error) {
  console.error(error)

  setter(state => ({
    ...state,
    data: null,
    loading: false,
    error: true
  }))
}

function numberFormat (number) {
  return new Intl.NumberFormat('en', { maximumSignificantDigits: 3 }).format(number)
}

function getTimeDelta (startDate, endDate, format) {
  if (!startDate || !endDate) return 'n/a'

  const diff = new Date(endDate) - new Date(startDate)
  const isFuture = diff > 0
  const absoluteDiff = Math.abs(diff)
  const days = Math.floor(absoluteDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((absoluteDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((absoluteDiff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((absoluteDiff % (1000 * 60)) / 1000)

  if (!format || format === 'default') {
    if (days > 0) {
      return `${days}d ${isFuture ? 'left' : 'ago'}`
    } else if (hours > 0) {
      return `${hours}h ${isFuture ? 'left' : 'ago'}`
    } else if (minutes > 0) {
      return `${minutes} min. ${isFuture ? 'left' : 'ago'}`
    } else {
      return `${seconds} sec. ${isFuture ? 'left' : 'ago'}`
    }
  }

  if (format === 'detailed') {
    return `${days}d:${hours}h:${minutes}m:${seconds}s`
  }

  return 'Invalid format'
}

export {
  getTransitionTypeString,
  fetchHandlerSuccess,
  fetchHandlerError,
  numberFormat,
  currencyRound,
  copyToClipboard,
  getTimeDelta
}
