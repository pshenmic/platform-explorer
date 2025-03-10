import { Badge } from '@chakra-ui/react'
import { Identifier, TimeDelta } from '../../data'
import { TransactionsIcon } from '../../ui/icons'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

export function TransactionSearchItem ({ transaction, className }) {
  return (
    <BaseSearchItem
      href={`/transaction/${transaction?.hash}`}
      className={className}
    >
      <BaseSearchItemContent
        mainContent={
          <>
            <TransactionsIcon className={'SearchResultsListItem__Icon'}/>
            <Identifier ellipsis={true} styles={['highlight-both']}>{transaction?.hash}</Identifier>
          </>
        }
        additionalContent={
          <Badge size={'xs'} colorScheme={'gray'}>Pending</Badge>
        }
        timestamp={<TimeDelta endDate={transaction?.timestamp || new Date()}/>}
      />
    </BaseSearchItem>
  )
}
