import { BATCH_TYPE_VALUES, TRANSACTION_TYPE_VALUES } from './TransactionsFilter'

export type QueryFilters = Record<string, string | number | boolean | string[] | null | undefined>

export const TX_TYPES = new Set(TRANSACTION_TYPE_VALUES)
export const BATCH_TYPES = new Set(BATCH_TYPE_VALUES)

function toNumber(value: unknown): number | null {
  if (value === '' || value == null) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function addRange(
  out: QueryFilters,
  value: unknown,
  minKey: string,
  maxKey: string,
  minAllowed: number,
  maxAllowed: number
) {
  const range = value as { min?: unknown; max?: unknown } | undefined
  const min = toNumber(range?.min)
  const max = toNumber(range?.max)
  if (min != null && min >= minAllowed) out[minKey] = min
  if (max != null && max >= maxAllowed) out[maxKey] = max
  const sentMin = out[minKey] as number | undefined
  const sentMax = out[maxKey] as number | undefined
  if (sentMin != null && sentMax != null && sentMax < sentMin) {
    delete out[minKey]
    delete out[maxKey]
  }
}

export function toTransactionsApiFilters(state: Record<string, unknown>): QueryFilters {
  const out: QueryFilters = {}
  addRange(out, state.gas, 'gas_min', 'gas_max', 0, 0)

  if (typeof state.hash === 'string') {
    const hash = state.hash.trim()
    if (/^[A-Za-z0-9]{64}$/.test(hash)) out.hash = hash
  }

  if (typeof state.owner === 'string') {
    const owner = state.owner.trim()
    if (/^[A-Za-z0-9]{43,44}$/.test(owner)) out.owner = owner
  }

  const status = Array.isArray(state.status)
    ? (state.status as string[]).filter(v => v === 'SUCCESS' || v === 'FAIL')
    : []
  if (status.length === 1) out.status = status[0]

  const typeSelected = Array.isArray(state.type) ? (state.type as string[]) : []
  const txTypes = typeSelected.filter(v => TX_TYPES.has(v))
  const batchTypes = typeSelected.filter(v => BATCH_TYPES.has(v))
  if (batchTypes.length) {
    out.transaction_type = ['BATCH']
    out.batch_type = batchTypes
  } else if (txTypes.length) {
    out.transaction_type = txTypes
  }

  const ts = state.timestamp as {
    start?: Date | null
    end?: Date | null
    mode?: 'days' | 'rolling'
  } | null
  const start = ts?.start ? new Date(ts.start) : null
  const end = ts?.end ? new Date(ts.end) : null
  const startValid = start && !Number.isNaN(start.getTime())
  const endValid = end && !Number.isNaN(end.getTime())
  if (startValid && endValid) {
    if (ts?.mode === 'rolling') {
      const from = start.getTime() <= end.getTime() ? start : end
      const to = start.getTime() <= end.getTime() ? end : start
      out.timestamp_start = from.toISOString()
      out.timestamp_end = to.toISOString()
    } else {
      const from = start.getTime() <= end.getTime() ? start : end
      const to = start.getTime() <= end.getTime() ? end : start
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      out.timestamp_start = from.toISOString()
      out.timestamp_end = to.toISOString()
    }
  }
  return out
}
