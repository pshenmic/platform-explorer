/** Deep-link to /transactions with the same type filters the list API understands. */
export function transactionsListHref ({ type, fromBatch }) {
  if (!type) return '/transactions'
  const params = new URLSearchParams()
  if (fromBatch) {
    params.set('batch_type', type)
  } else {
    params.set('transaction_type', type)
  }
  return `/transactions?${params.toString()}`
}

export function parseTypeParams (searchParams) {
  const split = (key) => searchParams
    .getAll(key)
    .flatMap(v => String(v).split(','))
    .map(v => v.trim())
    .filter(Boolean)

  return {
    transaction_type: split('transaction_type'),
    batch_type: split('batch_type')
  }
}

export function applyTypeParams (urlParameters, { transaction_type: tt = [], batch_type: bt = [] }) {
  urlParameters.delete('transaction_type')
  urlParameters.delete('batch_type')
  tt.forEach(v => urlParameters.append('transaction_type', v))
  bt.forEach(v => urlParameters.append('batch_type', v))
  return urlParameters
}
