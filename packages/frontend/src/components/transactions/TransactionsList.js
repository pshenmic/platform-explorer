import TransactionsListItem from './TransactionsListItem'
import './TransactionsList.scss'


export default function TransactionsList({transactions = [], size='l'}) {
    return (

        <div className={'TransactionsList ' + 'TransactionsList--Size' + size.toUpperCase()}>

            {transactions.map((transaction, key) => 
                    <TransactionsListItem
                        key={key}
                        size={size}
                        transaction={transaction}
                    />
                )
            }

            {transactions.length === 0 &&
                <div className='DataContractsList__EmptyMessage'>There are no data contracts created yet.</div>
            }

        </div>

    );
}
