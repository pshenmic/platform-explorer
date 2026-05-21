import { Filters } from '@components/filters'

const IdentityTypeEnum = {
  REGULAR: 'regular',
  MASTERNODE: 'masternode'
}

const identityTypeOptions = [
  { label: 'Regular', title: 'Regular identities', value: IdentityTypeEnum.REGULAR },
  { label: 'Masternode', title: 'Masternode identities', value: IdentityTypeEnum.MASTERNODE }
]

const pickIdentityType = (values) => {
  if (!Array.isArray(values) || values.length === 0 || values.length === identityTypeOptions.length) {
    return undefined
  }
  return values[0]
}

const orderByOptions = [
  { label: 'Block height', title: 'Order by block height', value: 'block_height' },
  { label: 'Balance', title: 'Order by balance', value: 'balance' },
  { label: 'Transactions', title: 'Order by tx count', value: 'tx_count' },
  { label: 'Documents', title: 'Order by documents count', value: 'documents_count' }
]

const rangeFormat = ({ min, max }) => {
  if (min && max) return `${min} – ${max}`
  if (min) return `Min ${min}`
  if (max) return `Max ${max}`
  return null
}

const filtersConfig = {
  identity_type: {
    type: 'multiselect',
    label: 'Type',
    title: 'Filter by identity type',
    options: identityTypeOptions,
    defaultValue: [IdentityTypeEnum.REGULAR, IdentityTypeEnum.MASTERNODE],
    formatValue: (values) => pickIdentityType(values) || undefined,
    isAllSelected: (values) => values.length === identityTypeOptions.length
  },
  balance: {
    type: 'range',
    label: 'Balance',
    title: 'Balance (credits)',
    defaultValue: { min: '', max: '' },
    minTitle: 'Min',
    minPlaceholder: 'ex. 1000000',
    maxTitle: 'Max',
    maxPlaceholder: 'ex. 1000000000',
    formatValue: rangeFormat
  },
  tx_count: {
    type: 'range',
    label: 'Transactions',
    title: 'Total transactions',
    defaultValue: { min: '', max: '' },
    minTitle: 'Min',
    minPlaceholder: 'ex. 0',
    maxTitle: 'Max',
    maxPlaceholder: 'ex. 1000',
    formatValue: rangeFormat
  },
  documents_count: {
    type: 'range',
    label: 'Documents',
    title: 'Total documents',
    defaultValue: { min: '', max: '' },
    minTitle: 'Min',
    minPlaceholder: 'ex. 0',
    maxTitle: 'Max',
    maxPlaceholder: 'ex. 100',
    formatValue: rangeFormat
  },
  data_contracts: {
    type: 'range',
    label: 'Data contracts',
    title: 'Total data contracts',
    defaultValue: { min: '', max: '' },
    minTitle: 'Min',
    minPlaceholder: 'ex. 0',
    maxTitle: 'Max',
    maxPlaceholder: 'ex. 10',
    formatValue: rangeFormat
  },
  order_by: {
    type: 'multiselect',
    label: 'Sort by',
    title: 'Order results by',
    options: orderByOptions,
    defaultValue: [],
    formatValue: (values) => (Array.isArray(values) && values[0]) || undefined,
    isAllSelected: () => false
  }
}

export const IdentitiesFilter = ({ initialFilters, onFilterChange, isMobile, className }) => {
  return (
    <Filters
      filtersConfig={filtersConfig}
      initialFilters={initialFilters}
      onFilterChange={(values) => {
        const payload = {
          identity_type: pickIdentityType(values.identity_type),
          balance_min: values.balance_min || undefined,
          balance_max: values.balance_max || undefined,
          tx_count_min: values.tx_count_min || undefined,
          tx_count_max: values.tx_count_max || undefined,
          documents_count_min: values.documents_count_min || undefined,
          documents_count_max: values.documents_count_max || undefined,
          data_contracts_min: values.data_contracts_min || undefined,
          data_contracts_max: values.data_contracts_max || undefined,
          order_by: (Array.isArray(values.order_by) && values.order_by[0]) || undefined
        }
        onFilterChange && onFilterChange(payload)
      }}
      isMobile={isMobile}
      className={`IdentitiesFilter ${className || ''}`}
      buttonText={'Add filter'}
      applyOnChange={false}
    />
  )
}

export default IdentitiesFilter
