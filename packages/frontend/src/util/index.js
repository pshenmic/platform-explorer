import { StateTransitionEnum } from '../app/enums/state.transition.type'
import currencyRound from './currencyRound'

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

export {
  getTransitionTypeString,
  fetchHandlerSuccess,
  fetchHandlerError,
  numberFormat,
  currencyRound
}
