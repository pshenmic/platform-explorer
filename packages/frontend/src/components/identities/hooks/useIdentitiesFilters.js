import { useQueryState } from 'nuqs'

export const useIdentitiesFilters = () => {
  const [identityType, setIdentityType] = useQueryState('identity_type', { scroll: false, shallow: true })
  const [balanceMin, setBalanceMin] = useQueryState('balance_min', { scroll: false, shallow: true })
  const [balanceMax, setBalanceMax] = useQueryState('balance_max', { scroll: false, shallow: true })
  const [txCountMin, setTxCountMin] = useQueryState('tx_count_min', { scroll: false, shallow: true })
  const [txCountMax, setTxCountMax] = useQueryState('tx_count_max', { scroll: false, shallow: true })
  const [docsMin, setDocsMin] = useQueryState('documents_count_min', { scroll: false, shallow: true })
  const [docsMax, setDocsMax] = useQueryState('documents_count_max', { scroll: false, shallow: true })
  const [contractsMin, setContractsMin] = useQueryState('data_contracts_min', { scroll: false, shallow: true })
  const [contractsMax, setContractsMax] = useQueryState('data_contracts_max', { scroll: false, shallow: true })
  const [orderBy, setOrderBy] = useQueryState('order_by', { scroll: false, shallow: true })

  const filters = {
    identity_type: identityType === 'regular' || identityType === 'masternode' ? identityType : undefined,
    balance_min: balanceMin || undefined,
    balance_max: balanceMax || undefined,
    tx_count_min: txCountMin != null && txCountMin !== '' ? Number(txCountMin) : undefined,
    tx_count_max: txCountMax != null && txCountMax !== '' ? Number(txCountMax) : undefined,
    documents_count_min: docsMin != null && docsMin !== '' ? Number(docsMin) : undefined,
    documents_count_max: docsMax != null && docsMax !== '' ? Number(docsMax) : undefined,
    data_contracts_min: contractsMin != null && contractsMin !== '' ? Number(contractsMin) : undefined,
    data_contracts_max: contractsMax != null && contractsMax !== '' ? Number(contractsMax) : undefined,
    order_by: orderBy || undefined
  }

  const setFilters = (next) => {
    if (!next) return

    if ('identity_type' in next) setIdentityType(next.identity_type || null)
    if ('balance_min' in next) setBalanceMin(next.balance_min || null)
    if ('balance_max' in next) setBalanceMax(next.balance_max || null)

    if ('tx_count_min' in next) setTxCountMin(next.tx_count_min !== '' && next.tx_count_min != null ? String(next.tx_count_min) : null)
    if ('tx_count_max' in next) setTxCountMax(next.tx_count_max !== '' && next.tx_count_max != null ? String(next.tx_count_max) : null)

    if ('documents_count_min' in next) setDocsMin(next.documents_count_min !== '' && next.documents_count_min != null ? String(next.documents_count_min) : null)
    if ('documents_count_max' in next) setDocsMax(next.documents_count_max !== '' && next.documents_count_max != null ? String(next.documents_count_max) : null)

    if ('data_contracts_min' in next) setContractsMin(next.data_contracts_min !== '' && next.data_contracts_min != null ? String(next.data_contracts_min) : null)
    if ('data_contracts_max' in next) setContractsMax(next.data_contracts_max !== '' && next.data_contracts_max != null ? String(next.data_contracts_max) : null)

    if ('order_by' in next) setOrderBy(next.order_by || null)
  }

  return { filters, setFilters }
}
