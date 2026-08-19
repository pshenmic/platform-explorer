export type TransactionTypeParams = {
  transaction_type: string[]
  batch_type: string[]
}

/** Deep-link to /transactions with the same type filters the list API understands. */
export function transactionsListHref ({ type, fromBatch }: { type?: string, fromBatch?: boolean }) {
  if (!type) return '/transactions'
  const params = new URLSearchParams()
  if (fromBatch) {
    params.set('batch_type', type)
  } else {
    params.set('transaction_type', type)
  }
  return `/transactions?${params.toString()}`
}

export function parseTypeParams (searchParams: { getAll: (key: string) => string[] }): TransactionTypeParams {
  const split = (key: string) => searchParams
    .getAll(key)
    .flatMap(v => String(v).split(','))
    .map(v => v.trim())
    .filter(Boolean)

  return {
    transaction_type: split('transaction_type'),
    batch_type: split('batch_type')
  }
}

export function applyTypeParams (
  urlParameters: URLSearchParams,
  { transaction_type: tt = [], batch_type: bt = [] }: Partial<TransactionTypeParams>
) {
  urlParameters.delete('transaction_type')
  urlParameters.delete('batch_type')
  tt.forEach(v => urlParameters.append('transaction_type', v))
  bt.forEach(v => urlParameters.append('batch_type', v))
  return urlParameters
}
