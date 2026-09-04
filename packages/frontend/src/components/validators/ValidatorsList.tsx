'use client'

import type { Validator } from '../../types'
import { DateBlock, Identifier, NotActive } from '../data'
import { Badge } from '../ui/Badge'
import { DataList } from '../ui/lists'
import { ErrorMessageBlock } from '@components/Errors'

export const ValidatorsListSceleton = ({ pageSize = 25 }: { pageSize?: number | string }) => (
  <DataList
    className={'ValidatorsList'}
    items={[]}
    columns={validatorColumns()}
    loading
    skeletonCount={String(pageSize).toLowerCase() === 'all' ? 50 : Number(pageSize) || 25}
  />
)

interface ValidatorsListProps {
  loading?: boolean
  list?: Validator[]
  pageSize?: number | string
  error?: boolean
}

function validatorColumns() {
  return [
    {
      key: 'identifier',
      header: 'Identifier',
      grow: true,
      minWidth: 160,
      cell: (validator: Validator) =>
        validator?.proTxHash ? (
          <Identifier avatar={true} copyButton={true} styles={['highlight-both']}>
            {validator.proTxHash}
          </Identifier>
        ) : (
          <NotActive />
        )
    },
    {
      key: 'active',
      header: 'Active',
      minWidth: 80,
      align: 'center',
      priority: 2,
      cell: (validator: Validator) =>
        validator?.isActive !== undefined ? (
          <Badge colorScheme={validator?.isActive ? 'orange' : 'gray'}>
            {validator?.isActive ? 'true' : 'false'}
          </Badge>
        ) : (
          <NotActive />
        )
    },
    {
      key: 'lastBlockHeight',
      header: 'Last block height',
      minWidth: 110,
      align: 'center',
      priority: 1,
      cell: (validator: Validator) => validator?.lastProposedBlockHeader?.height || '-'
    },
    {
      key: 'proposedBlocksAmount',
      header: 'Blocks proposed',
      minWidth: 110,
      align: 'center',
      priority: 1,
      cell: (validator: Validator) => validator?.proposedBlocksAmount || '-'
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      minWidth: 120,
      align: 'right',
      cell: (validator: Validator) => (
        <DateBlock
          timestamp={validator.lastProposedBlockHeader?.timestamp}
          format="dateOnly"
        />
      )
    }
  ]
}

export const ValidatorsList = ({ loading, list, pageSize, error }: ValidatorsListProps) => {
  if (error) {
    return (
      <div className={'ListPage__Error'}>
        <ErrorMessageBlock />
      </div>
    )
  }

  return (
    <DataList
      className={'ValidatorsList'}
      items={list || []}
      columns={validatorColumns()}
      loading={loading}
      skeletonCount={String(pageSize).toLowerCase() === 'all' ? 50 : Number(pageSize) || 25}
      rowHref={validator => `/validator/${validator.proTxHash}`}
      rowKey={validator => validator.proTxHash || ''}
      emptyMessage={'There are no validators yet.'}
    />
  )
}
