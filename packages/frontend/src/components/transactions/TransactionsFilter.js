import { TransactionTypesInfo } from '../../enums/state.transition.type'
import { TransactionStatusBadge, TypeBadge } from './index'
import BatchTypeBadge from './BatchTypeBadge'
import { BatchActions } from '../../enums/batchTypes'
import { Filters } from '../filters'
import { Identifier } from '../data'

const transactionOptions = [
  {
    label: <TypeBadge type={'DATA_CONTRACT_CREATE'} />,
    title: TransactionTypesInfo.DATA_CONTRACT_CREATE.title,
    value: 'DATA_CONTRACT_CREATE'
  },
  {
    label: <TypeBadge type={'IDENTITY_CREATE'} />,
    title: TransactionTypesInfo.IDENTITY_CREATE.title,
    value: 'IDENTITY_CREATE'
  },
  {
    label: <TypeBadge type={'IDENTITY_TOP_UP'} />,
    title: TransactionTypesInfo.IDENTITY_TOP_UP.title,
    value: 'IDENTITY_TOP_UP'
  },
  {
    label: <TypeBadge type={'DATA_CONTRACT_UPDATE'} />,
    title: TransactionTypesInfo.DATA_CONTRACT_UPDATE.title,
    value: 'DATA_CONTRACT_UPDATE'
  },
  {
    label: <TypeBadge type={'IDENTITY_UPDATE'} />,
    title: TransactionTypesInfo.IDENTITY_UPDATE.title,
    value: 'IDENTITY_UPDATE'
  },
  {
    label: <TypeBadge type={'IDENTITY_CREDIT_WITHDRAWAL'} />,
    title: TransactionTypesInfo.IDENTITY_CREDIT_WITHDRAWAL.title,
    value: 'IDENTITY_CREDIT_WITHDRAWAL'
  },
  {
    label: <TypeBadge type={'IDENTITY_CREDIT_TRANSFER'} />,
    title: TransactionTypesInfo.IDENTITY_CREDIT_TRANSFER.title,
    value: 'IDENTITY_CREDIT_TRANSFER'
  },
  {
    label: <TypeBadge type={'MASTERNODE_VOTE'} />,
    title: TransactionTypesInfo.MASTERNODE_VOTE.title,
    value: 'MASTERNODE_VOTE'
  }
]

const batchOptions = [
  {
    label: <BatchTypeBadge batchType={'DOCUMENT_CREATE'} />,
    title: BatchActions.DOCUMENT_CREATE.title,
    value: 'DOCUMENT_CREATE'
  },
  {
    label: <BatchTypeBadge batchType={'DOCUMENT_REPLACE'} />,
    title: BatchActions.DOCUMENT_REPLACE.title,
    value: 'DOCUMENT_REPLACE'
  },
  {
    label: <BatchTypeBadge batchType={'DOCUMENT_DELETE'} />,
    title: BatchActions.DOCUMENT_DELETE.title,
    value: 'DOCUMENT_DELETE'
  },
  {
    label: <BatchTypeBadge batchType={'DOCUMENT_TRANSFER'} />,
    title: BatchActions.DOCUMENT_TRANSFER.title,
    value: 'DOCUMENT_TRANSFER'
  },
  {
    label: <BatchTypeBadge batchType={'DOCUMENT_UPDATE_PRICE'} />,
    title: BatchActions.DOCUMENT_UPDATE_PRICE.title,
    value: 'DOCUMENT_UPDATE_PRICE'
  },
  {
    label: <BatchTypeBadge batchType={'DOCUMENT_PURCHASE'} />,
    title: BatchActions.DOCUMENT_PURCHASE.title,
    value: 'DOCUMENT_PURCHASE'
  },
  {
    label: <BatchTypeBadge batchType={'TOKEN_BURN'} />,
    title: BatchActions.TOKEN_BURN.title,
    value: 'TOKEN_BURN'
  },
  {
    label: <BatchTypeBadge batchType={'TOKEN_MINT'} />,
    title: BatchActions.TOKEN_MINT.title,
    value: 'TOKEN_MINT'
  },
  {
    label: <BatchTypeBadge batchType={'TOKEN_TRANSFER'} />,
    title: BatchActions.TOKEN_TRANSFER.title,
    value: 'TOKEN_TRANSFER'
  },
  {
    label: <BatchTypeBadge batchType={'TOKEN_FREEZE'} />,
    title: BatchActions.TOKEN_FREEZE.title,
    value: 'TOKEN_FREEZE'
  },
  {
    label: <BatchTypeBadge batchType={'TOKEN_UNFREEZE'} />,
    title: BatchActions.TOKEN_UNFREEZE.title,
    value: 'TOKEN_UNFREEZE'
  },
  {
    label: <BatchTypeBadge batchType={'TOKEN_DESTROY_FROZEN_FUNDS'} />,
    title: BatchActions.TOKEN_DESTROY_FROZEN_FUNDS.title,
    value: 'TOKEN_DESTROY_FROZEN_FUNDS'
  },
  {
    label: <BatchTypeBadge batchType={'TOKEN_CLAIM'} />,
    title: BatchActions.TOKEN_CLAIM.title,
    value: 'TOKEN_CLAIM'
  },
  {
    label: <BatchTypeBadge batchType={'TOKEN_EMERGENCY_ACTION'} />,
    title: BatchActions.TOKEN_EMERGENCY_ACTION.title,
    value: 'TOKEN_EMERGENCY_ACTION'
  },
  {
    label: <BatchTypeBadge batchType={'TOKEN_CONFIG_UPDATE'} />,
    title: BatchActions.TOKEN_CONFIG_UPDATE.title,
    value: 'TOKEN_CONFIG_UPDATE'
  },
  {
    label: <BatchTypeBadge batchType={'TOKEN_DIRECT_PURCHASE'} />,
    title: BatchActions.TOKEN_DIRECT_PURCHASE.title,
    value: 'TOKEN_DIRECT_PURCHASE'
  },
  {
    label: <BatchTypeBadge batchType={'TOKEN_SET_PRICE_FOR_DIRECT_PURCHASE'} />,
    title: BatchActions.TOKEN_SET_PRICE_FOR_DIRECT_PURCHASE.title,
    value: 'TOKEN_SET_PRICE_FOR_DIRECT_PURCHASE'
  }
]

const statusOptions = [
  {
    label: <TransactionStatusBadge status={'SUCCESS'} />,
    title: 'Success',
    value: 'SUCCESS'
  },
  {
    label: <TransactionStatusBadge status={'FAIL'} />,
    title: 'Fail',
    value: 'FAIL'
  }
]

const filtersConfig = {
  transaction_type: {
    type: 'multiselect',
    label: 'Transaction Type',
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
  batch_type: {
    type: 'multiselect',
    label: 'Batch Type',
    title: 'Batch Types',
    options: batchOptions,
    defaultValue: batchOptions.map(t => t.value),
    formatValue: (values) => {
      if (values.length === batchOptions.length) return null
      if (values.length > 1) return `${values.length} categories`
      return batchOptions.find(t => t.value === values[0])?.title || values[0]
    },
    isAllSelected: (values) => values.length === batchOptions.length
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
    label: 'Owner',
    title: 'Filter by owner',
    type: 'search',
    entityType: 'identities',
    placeholder: 'OWNER ID OR IDENTITY',
    defaultValue: '',
    formatValue: (value) => value || null,
    mobileTagRenderer: (value) => (
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{value}</Identifier>
    )
  },
  timestamp: {
    label: 'Date',
    title: 'Date range',
    type: 'daterange',
    defaultValue: null,
    formatValue: (value) => {
      return `${value?.start ? `from ${value?.start?.toLocaleDateString()}` : ''} ${value?.end ? `to ${value?.end?.toLocaleDateString()}` : ''}`
    }
  }
}

export default function TransactionsFilter ({ onFilterChange, isMobile, className }) {
  return (
    <Filters
      filtersConfig={filtersConfig}
      onFilterChange={onFilterChange}
      isMobile={isMobile}
      className={`TransactionsFilter ${className || ''}`}
      buttonText={'Add filter'}
      applyOnChange={false}
    />
  )
}
