import { StateTransitionEnum, TransactionTypesInfo } from '../../enums/state.transition.type'
import { TransactionStatusBadge, TypeBadge } from './index'
import { Filters } from '../filters'
import './TransactionsFilter.scss'

const transactionOptions = [
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

const statusOptions = [
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

const filtersConfig = {
  transaction_type: {
    type: 'multiselect',
    label: 'Type',
    title: 'Transaction Types',
    options: transactionOptions,
    defaultValue: transactionOptions.map(t => t.value),
    formatValue: (values) => {
      if (values.length === transactionOptions.length) return null
      if (values.length > 1) return `${values.length} categories`
      return transactionOptions.find(t => t.value === values[0])?.title || values[0]
    },
    isAllSelected: (values) => values.length === transactionOptions.length
  },
  status: {
    type: 'multiselect',
    label: 'Status',
    title: 'Status',
    options: statusOptions,
    defaultValue: statusOptions.map(s => s.value),
    formatValue: (values) => {
      if (values.length === statusOptions.length) return null
      if (values.length > 1) return `${values.length} values`
      return statusOptions.find(s => s.value === values[0])?.title || values[0]
    },
    isAllSelected: (values) => values.length === statusOptions.length
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
  owner: {
    type: 'input',
    label: 'Owner',
    title: 'Identity Identifier',
    placeholder: 'Enter identity identifier',
    defaultValue: '',
    formatValue: (value) => value || null
  }
}

export default function TransactionsFilter ({ initialFilters, onFilterChange, isMobile, className }) {
  return (
    <Filters
      filtersConfig={filtersConfig}
      initialFilters={initialFilters}
      onFilterChange={onFilterChange}
      isMobile={isMobile}
      className={`TransactionsFilter ${className || ''}`}
      buttonText={'Add Filter'}
    />
  )
}
