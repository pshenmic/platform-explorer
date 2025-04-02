// import { StateTransitionEnum, TransactionTypesInfo } from '../../enums/state.transition.type'
// import { TransactionStatusBadge } from './index'
import { Filters } from '../filters'
import { Identifier } from '../data'

// epoch_index_min=1000
// epoch_index_max=1200

// height_min=2000
// height_max=4000
// gas_min=1
// gas_max=99999999999

// timestamp_start=2024-08-29T23:24:11.516z
// timestamp_end=2025-08-29T23:24:11.516z

// tx_count_min=2
// tx_count_max=11

// validator=C11C1168DCF9479475CB1355855E30EA75C0CDDA8A8F9EA80591568DD1C33BA8

const filtersConfig = {
  height: {
    type: 'range',
    label: 'Height',
    title: 'Height Range',
    defaultValue: { min: '', max: '' },
    minTitle: 'Minimum amount',
    minPlaceholder: 'ex. 0...',
    maxTitle: 'Maximum amount',
    maxPlaceholder: 'ex. 10000000...',
    formatValue: ({ min, max }) => {
      if (min && max) return `${min} - ${max} Credits`
      if (min) return `Min ${min} Credits`
      if (max) return `Max ${max} Credits`
      return null
    }
  },
  epoch_index: {
    type: 'range',
    label: 'Epoch',
    title: 'Epoch Range',
    defaultValue: { min: '', max: '' },
    minTitle: 'Minimum amount',
    minPlaceholder: 'ex. 0...',
    maxTitle: 'Maximum amount',
    maxPlaceholder: 'ex. 10000000...',
    formatValue: ({ min, max }) => {
      if (min && max) return `${min} - ${max}`
      if (min) return `Min ${min}`
      if (max) return `Max ${max}`
      return null
    }
  },
  tx_count: {
    type: 'range',
    label: 'TX count',
    title: 'Transactions count range',
    defaultValue: { min: '', max: '' },
    minTitle: 'Minimum amount',
    minPlaceholder: 'ex. 0...',
    maxTitle: 'Maximum amount',
    maxPlaceholder: 'ex. 10000000...',
    formatValue: ({ min, max }) => {
      if (min && max) return `${min} - ${max} txs`
      if (min) return `Min ${min} txs`
      if (max) return `Max ${max} txs`
      return null
    }
  },
  gas: {
    type: 'range',
    label: 'Gas',
    title: 'Gas Range',
    defaultValue: { min: '', max: '' },
    minTitle: 'Minimum amount',
    minPlaceholder: 'ex. 0...',
    maxTitle: 'Maximum amount',
    maxPlaceholder: 'ex. 10000000...',
    formatValue: ({ min, max }) => {
      if (min && max) return `${min} - ${max} Credits`
      if (min) return `Min ${min} Credits`
      if (max) return `Max ${max} Credits`
      return null
    }
  },
  validator: {
    type: 'search',
    filterType: 'validators',
    label: 'Validator',
    title: 'Filter by validator',
    placeholder: 'Validator ID',
    defaultValue: '',
    formatValue: (value) => value || null,
    mobileTagRenderer: (value) => (
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{value}</Identifier>
    )
  }
}

export default function BlocksFilter ({ initialFilters, onFilterChange, isMobile, className }) {
  return (
    <Filters
      filtersConfig={filtersConfig}
      initialFilters={initialFilters}
      onFilterChange={onFilterChange}
      isMobile={isMobile}
      className={`BlocksFilter ${className || ''}`}
      buttonText={'Add filter'}
    />
  )
}
