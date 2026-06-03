import { Flex } from '@chakra-ui/react'
import { Identifier, TimeDelta } from '../../data'
import { TransactionsIcon } from '../../ui/icons'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'
import { TransactionStatusBadge } from '../../transactions'

export function TransactionSearchItem ({ transaction, className, onClick }) {
  // Дубль-вхождение ведёт на ту же транзакцию с выбранным блоком (master-detail ?block=),
  // каноническое — на обычную страницу транзакции.
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
