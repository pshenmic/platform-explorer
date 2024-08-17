import copyToClipboard from './copyToClipboard'
import { StateTransitionEnum, TransactionTypesEnum } from '../app/enums/state.transition.type'
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

function getTimeDelta (startDate, endDate) {
  if (!startDate || !endDate) return 'n/a'

  const diff = new Date(endDate) - new Date(startDate)

  const isFuture = diff > 0
  const absoluteDiff = Math.abs(diff)

  if (absoluteDiff < 60 * 1000) {
    return `${Math.floor(absoluteDiff / 1000)} sec. ${isFuture ? 'left' : 'ago'}`
  } else {
    return `${Math.floor(absoluteDiff / 1000 / 60)} min. ${isFuture ? 'left' : 'ago'}`
  }
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
