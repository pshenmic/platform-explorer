import copyToClipboard from './copyToClipboard'
import { StateTransitionEnum, TransactionTypesEnum } from '../enums/state.transition.type'
import currencyRound from './currencyRound'
import { getDaysBetweenDates, getDynamicRange, getTimeDelta } from './datetime'

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

function paginationHandler (setter, currentPage) {
  setter(state => ({
    ...state,
    props: {
      ...state.props,
      currentPage
    }
  }))
}

function setLoadingProp (setter, value = true) {
  setter(state => ({ ...state, loading: value }))
}

function numberFormat (number) {
  return new Intl.NumberFormat('en', { maximumSignificantDigits: 3 }).format(number)
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

function findActiveAlias (aliases = []) {
  if (!aliases?.length) return null
  return aliases?.find(alias => alias.status === 'ok')
}

export {
  getTransitionTypeStringById,
  fetchHandlerSuccess,
  fetchHandlerError,
  paginationHandler,
  setLoadingProp,
  numberFormat,
  currencyRound,
  copyToClipboard,
  getTimeDelta,
  getTransitionTypeKeyById,
  creditsToDash,
  roundUsd,
  getDaysBetweenDates,
  getDynamicRange,
  findActiveAlias
}
