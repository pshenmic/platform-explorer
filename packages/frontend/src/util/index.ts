import type { Alias, LoadableSetter } from '../types'
import copyToClipboard from './copyToClipboard'
import currencyRound from './currencyRound'
import { getDaysBetweenDates, getDynamicRange, getTimeDelta, formatDate } from './datetime'
import { normalizePagination } from './table'
import { encodeDateToURL, decodeDateFromURL } from './url'

function fetchHandlerSuccess<T>(setter: LoadableSetter<T>, data: Partial<T>): void {
  setter(state => ({
    ...state,
    data: {
      ...(state.data as Record<string, unknown> | null),
      ...data
    } as T,
    loading: false,
    error: false
  }))
}

function fetchHandlerError<T>(setter: LoadableSetter<T>, error: unknown): void {
  console.error(error)

  setter(state => ({
    ...state,
    data: null,
    loading: false,
    error: true
  }))
}

function paginationHandler<T>(setter: LoadableSetter<T>, currentPage: number): void {
  setter(state => ({
    ...state,
    props: {
      ...state.props,
      currentPage
    }
  }))
}

function setLoadingProp<T>(setter: LoadableSetter<T>, value = true): void {
  setter(state => ({ ...state, loading: value }))
}

function numberFormat(number: number | string): string {
  return new Intl.NumberFormat('en', { maximumSignificantDigits: 3 }).format(Number(number))
}

// full number with thousand separators — used where precision beats compactness (toolbar stats)
function formatFullNumber(value: unknown): string | unknown {
  return typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString('en-US') : value
}

function creditsToDash(credits: number): number {
  return credits / 10e10
}

function roundUsd(usd: number, maxDecimals = 5): string {
  if (usd >= 0.01 || usd < 1 / 10 ** maxDecimals) return usd.toFixed(2)

  const multiplier = 10 ** maxDecimals
  const roundedValue = Math.round(usd * multiplier) / multiplier
  const stringValue = roundedValue.toString()
  const decimalPart = stringValue.split('.')[1]
  let precision = 2

  if (decimalPart) {
    const firstSignificantIndex = decimalPart.search(/[1-9]/)
    precision = firstSignificantIndex + 1 <= maxDecimals ? firstSignificantIndex + 1 : 2
  }

  return usd.toFixed(precision)
}

function removeTrailingZeros(value: number | string, maxDecimals = 8): number {
  const numericValue = typeof value !== 'number' ? Number(value) : value
  if (isNaN(numericValue)) return numericValue

  const fixedValue = numericValue.toFixed(maxDecimals)
  return parseFloat(fixedValue)
}

function findActiveAlias(aliases: Alias[] = []): Alias | null {
  if (!aliases?.length) return null
  return aliases?.find(alias => alias.status === 'ok') ?? null
}

type TokenLocalization = { singularForm?: string }

const getTokenName = (localizations?: Record<string, TokenLocalization> | null): string =>
  localizations?.en?.singularForm || Object.values(localizations || {})[0]?.singularForm || ''

const getMinTokenPrice = (prices?: Array<{ price: string | number }> | null): number | null => {
  if (!prices || prices.length === 0) return null
  return Math.min(...prices.map(p => parseFloat(String(p.price))))
}

export {
  fetchHandlerSuccess,
  fetchHandlerError,
  paginationHandler,
  setLoadingProp,
  numberFormat,
  currencyRound,
  formatFullNumber,
  copyToClipboard,
  getTimeDelta,
  creditsToDash,
  roundUsd,
  removeTrailingZeros,
  getDaysBetweenDates,
  getDynamicRange,
  findActiveAlias,
  getTokenName,
  getMinTokenPrice,
  normalizePagination,
  encodeDateToURL,
  decodeDateFromURL,
  formatDate
}
