import { Flex } from '@chakra-ui/react'
import { Identifier, TimeDelta } from '../../data'
import { TransactionsIcon } from '../../ui/icons'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'
import { TransactionStatusBadge } from '../../transactions'

export function TransactionSearchItem ({ transaction, className, onClick }) {
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
          <Flex alignItems={'center'} w={'100%'}>
            <TransactionsIcon className={'SearchResultsListItem__Icon'}/>
            <Identifier ellipsis={true} styles={['highlight-both']}>{transaction?.hash}</Identifier>
          </Flex>
        }
        additionalContent={
          <TransactionStatusBadge status={transaction?.status}/>
        }
        timestamp={<TimeDelta endDate={transaction?.timestamp}/>}
      />
    </BaseSearchItem>
  )
}
