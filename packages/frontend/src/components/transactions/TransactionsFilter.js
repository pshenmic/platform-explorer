import { StateTransitionEnum, TransactionTypesInfo } from '../../enums/state.transition.type'
import { Filters } from '../filters'
import { TransactionStatusBadge, TypeBadge } from './index'
import './TransactionsFilter.scss'

// Transaction types configuration
const TRANSACTION_TYPES = [
  {
    label: <TypeBadge typeId={StateTransitionEnum.DATA_CONTRACT_CREATE}/>,
    title: TransactionTypesInfo.DATA_CONTRACT_CREATE.title,
    value: StateTransitionEnum.DATA_CONTRACT_CREATE
  },
  {
    label: <TypeBadge typeId={StateTransitionEnum.DOCUMENTS_BATCH}/>,
    title: TransactionTypesInfo.DOCUMENTS_BATCH.title,
    value: StateTransitionEnum.DOCUMENTS_BATCH
  },
  {
    label: <TypeBadge typeId={StateTransitionEnum.IDENTITY_CREATE}/>,
    title: TransactionTypesInfo.IDENTITY_CREATE.title,
    value: StateTransitionEnum.IDENTITY_CREATE
  },
  {
    label: <TypeBadge typeId={StateTransitionEnum.IDENTITY_TOP_UP}/>,
    title: TransactionTypesInfo.IDENTITY_TOP_UP.title,
    value: StateTransitionEnum.IDENTITY_TOP_UP
  },
  {
    label: <TypeBadge typeId={StateTransitionEnum.DATA_CONTRACT_UPDATE}/>,
    title: TransactionTypesInfo.DATA_CONTRACT_UPDATE.title,
    value: StateTransitionEnum.DATA_CONTRACT_UPDATE
  },
  {
    label: <TypeBadge typeId={StateTransitionEnum.IDENTITY_UPDATE}/>,
    title: TransactionTypesInfo.IDENTITY_UPDATE.title,
    value: StateTransitionEnum.IDENTITY_UPDATE
  },
  {
    label: <TypeBadge typeId={StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL}/>,
    title: TransactionTypesInfo.IDENTITY_CREDIT_WITHDRAWAL.title,
    value: StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL
  },
  {
    label: <TypeBadge typeId={StateTransitionEnum.IDENTITY_CREDIT_TRANSFER}/>,
    title: TransactionTypesInfo.IDENTITY_CREDIT_TRANSFER.title,
    value: StateTransitionEnum.IDENTITY_CREDIT_TRANSFER
  },
  {
    label: <TypeBadge typeId={StateTransitionEnum.MASTERNODE_VOTE}/>,
    title: TransactionTypesInfo.MASTERNODE_VOTE.title,
    value: StateTransitionEnum.MASTERNODE_VOTE
  }
]

// Status types configuration
const STATUS_TYPES = [
  {
    label: <TransactionStatusBadge status={'SUCCESS'}/>,
    title: 'Success',
    value: 'SUCCESS'
  },
  {
    label: <TransactionStatusBadge status={'FAIL'}/>,
    title: 'Fail',
    value: 'FAIL'
  }
]

// Filters configuration object
const FILTERS_CONFIG = {
  transaction_type: {
    type: 'multiselect',
    label: 'Type',
    title: 'Transaction Types',
    options: TRANSACTION_TYPES,
    defaultValue: TRANSACTION_TYPES.map(t => t.value),
    formatValue: (values) => {
      if (values.length === TRANSACTION_TYPES.length) return null
      if (values.length > 1) return `${values.length} categories`
      return TRANSACTION_TYPES.find(t => t.value === values[0])?.title || values[0]
    },
    isAllSelected: (values) => values.length === TRANSACTION_TYPES.length
  },
  status: {
    type: 'multiselect',
    label: 'Status',
    title: 'Status',
    options: STATUS_TYPES,
    defaultValue: STATUS_TYPES.map(s => s.value),
    formatValue: (values) => {
      if (values.length === STATUS_TYPES.length) return null
      if (values.length > 1) return `${values.length} values`
      return STATUS_TYPES.find(s => s.value === values[0])?.title || values[0]
    },
    isAllSelected: (values) => values.length === STATUS_TYPES.length
  },
  owner: {
    type: 'input',
    label: 'Owner',
    title: 'Identity Identifier',
    placeholder: 'Enter identity identifier',
    defaultValue: '',
    formatValue: (value) => value || null
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
  }
}

export default function TransactionsFilter ({ initialFilters, onFilterChange, isMobile, className }) {
  return (
    <Filters
      filtersConfig={FILTERS_CONFIG}
      initialFilters={initialFilters}
      onFilterChange={onFilterChange}
      isMobile={isMobile}
      className={`TransactionsFilter ${className || ''}`}
      buttonText="Add Filter"
    />
  )
}
