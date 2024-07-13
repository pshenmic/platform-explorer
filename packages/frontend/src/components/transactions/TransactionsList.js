import TransactionsListItem from './TransactionsListItem'
import { EmptyListMessage } from '../lists'
import './TransactionsList.scss'

export default function TransactionsList ({ transactions = [], size = 'l' }) {
  return (
    <div className={'TransactionsList ' + 'TransactionsList--Size' + size.toUpperCase()}>
        {transactions.map((transaction, key) =>
            <TransactionsListItem
                key={key}
                size={size}
                transaction={transaction}
            />
        )}

        {transactions.length === 0 &&
            <EmptyListMessage>There are no transactions created yet.</EmptyListMessage>
        }
    </div>
  )
}
