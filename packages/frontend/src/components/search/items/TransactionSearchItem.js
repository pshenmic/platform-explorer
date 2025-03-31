import { Badge, Flex } from '@chakra-ui/react'
import { Identifier, TimeDelta } from '../../data'
import { TransactionsIcon } from '../../ui/icons'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

export function TransactionSearchItem ({ transaction, className, onClick }) {
  return (
    <BaseSearchItem
      href={`/transaction/${transaction?.hash}`}
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
          <Badge size={'xs'} colorScheme={'gray'}>Pending</Badge>
        }
        timestamp={<TimeDelta endDate={transaction?.timestamp || new Date()}/>}
      />
    </BaseSearchItem>
  )
}
