import copyToClipboard from './copyToClipboard'
import { StateTransitionEnum, TransactionTypesEnum } from '../enums/state.transition.type'
import currencyRound from './currencyRound'

function getTransitionTypeStringById (id) {
  const [stateTransitionType] = Object.entries(StateTransitionEnum)
    .filter(([key]) => StateTransitionEnum[key] === id)
    .map(([key]) => key)

  return TransactionTypesEnum[stateTransitionType] ?? 'UNKNOWN'
}

function getTransitionTypeKeyById (id) {
  const [stateTransitionType] = Object.entries(StateTransitionEnum)
    .filter(([key]) => StateTransitionEnum[key] === id)
    .map(([key]) => key)

  return stateTransitionType
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
    return `${days}d:${hours}h:${minutes}m`
  }

  return 'Invalid format'
}

function creditsToDash (credits) {
  return credits / 10e10
}

function roundUsd (usd, maxDecimals = 5) {
  if (usd >= 0.01 || usd < 1 / Math.pow(10, maxDecimals)) return usd.toFixed(2)

  const multiplier = Math.pow(10, maxDecimals)
  const roundedValue = Math.round(usd * multiplier) / multiplier
  const stringValue = roundedValue.toString()
  const decimalPart = stringValue.split('.')[1]
  let precision = 2

  if (decimalPart) {
    const firstSignificantIndex = decimalPart.search(/[1-9]/)
    precision = firstSignificantIndex + 1 <= maxDecimals
      ? firstSignificantIndex + 1
      : 2
  }

  return usd.toFixed(precision)
}

export {
  getTransitionTypeStringById,
  fetchHandlerSuccess,
  fetchHandlerError,
  numberFormat,
  currencyRound,
  copyToClipboard,
  getTimeDelta,
  getTransitionTypeKeyById,
  creditsToDash,
  roundUsd
}
