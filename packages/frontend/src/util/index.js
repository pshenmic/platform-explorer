import { StateTransitionEnum } from '../app/enums/state.transition.type'

const getTransitionTypeString = (id) => {
  const [stateTransitionType] = Object.entries(StateTransitionEnum)
    .filter(([key]) => StateTransitionEnum[key] === id)
    .map(([key]) => key)

  return stateTransitionType ?? 'UNKNOWN'
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

function currencyRound (number) {
  const num = Number(number)
  const billions = num / 1.0e9
  const millions = num / 1.0e6
  const thousands = num / 1.0e3

  if (Math.abs(num) >= 1.0e9 && Math.abs(billions) >= 100) return `${numberFormat(Math.round(billions))}B`
  if (Math.abs(num) >= 1.0e9 && Math.abs(billions) >= 10) return `${numberFormat(billions.toFixed(1))}B`
  if (Math.abs(num) >= 1.0e9) return `${numberFormat(billions.toFixed(2))}B`
  if (Math.abs(num) >= 1.0e6 && Math.abs(millions) >= 100) return `${numberFormat(Math.round(millions))}M`
  if (Math.abs(num) >= 1.0e6 && Math.abs(millions) >= 10) return `${numberFormat(millions.toFixed(1))}M`
  if (Math.abs(num) >= 1.0e6) return `${numberFormat(millions.toFixed(2))}M`
  if (Math.abs(num) >= 1.0e3 && Math.abs(thousands) >= 100) return `${numberFormat(Math.round(thousands))}K`
  if (num >= 1.0e3 && thousands >= 10) return `${numberFormat(thousands.toFixed(1))}K`
  if (Math.abs(num) >= 1.0e3) return `${numberFormat(thousands.toFixed(1))}K`

  return num.toFixed()
}

export {
  getTransitionTypeString,
  fetchHandlerSuccess,
  fetchHandlerError,
  numberFormat,
  currencyRound
}
