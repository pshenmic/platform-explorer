import './TransactionCard.scss'
import { ValueCard } from '../cards'
import { Identifier, InfoLine } from '../data'

function TransactionsListItem ({ transaction }) {
  console.log('transaction', transaction)

  return (
    <div className={'TransactionCard'}>
      <InfoLine
        title={'Type'}
        value={transaction?.action}
        // loading={transaction.loading}
        error={transaction?.action === undefined}
      />
      <InfoLine
        title={'Data Contract Identifier'}
        value={(
          <ValueCard link={`/dataContract/${transaction.dataContractId}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {transaction.dataContractId}
            </Identifier>
          </ValueCard>
        )}
        // loading={transaction.loading}
        // error={transaction.error}
      />
    </div>
  )
}

export default TransactionsListItem
