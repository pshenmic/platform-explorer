import type { ComponentType, ReactNode } from 'react'
import type { Transaction } from '../../../types'
import type { WithClassName } from '../../../types/common'
// Untyped JS components — loose wrappers until data/* / transactions/* are migrated
import { Identifier as IdentifierJs, TimeDelta as TimeDeltaJs } from '../../data'
import { TransactionsIcon } from '../../ui/icons'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'
import TransactionStatusBadge from '../../transactions/TransactionStatusBadge'

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  ellipsis?: boolean
  styles?: string[]
}>
const TimeDelta = TimeDeltaJs as ComponentType<{ endDate?: string | Date | null }>

type SearchTransaction = Partial<Transaction> & {
  isDuplicate?: boolean
}

interface TransactionSearchItemProps extends WithClassName {
  transaction?: SearchTransaction | null
  onClick?: (data: unknown) => void
}

export function TransactionSearchItem({
  transaction,
  className,
  onClick
}: TransactionSearchItemProps) {
  // Duplicate rows deep-link to the same tx with that occurrence preselected (?block=)
  const href = transaction?.isDuplicate
    ? `/transaction/${transaction?.hash}?block=${transaction?.blockHash}`
    : `/transaction/${transaction?.hash}`

  return (
    <BaseSearchItem
      href={href}
      className={`${className || ''}`}
      gridClassModifier={'Transaction'}
      onClick={onClick}
      data={transaction}
    >
      <BaseSearchItemContent
        mainContent={
          <div className={'SearchResultsListItem__IdentifierContainer'}>
            <TransactionsIcon className={'SearchResultsListItem__Icon'} />
            <Identifier ellipsis={true} styles={['highlight-both']}>
              {transaction?.hash}
            </Identifier>
          </div>
        }
        additionalContent={<TransactionStatusBadge status={transaction?.status} />}
        timestamp={<TimeDelta endDate={transaction?.timestamp} />}
      />
    </BaseSearchItem>
  )
}
