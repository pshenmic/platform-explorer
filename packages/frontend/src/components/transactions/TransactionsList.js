import TransactionsListItem from './TransactionsListItem'


export default function TransactionsList({transactions = [], size='l'}) {
    return (
        <div>

            {transactions.map((transaction, key) => {
                return (
                    <TransactionsListItem
                        key={key}
                        size={size}
                        transaction={transaction}
                    />
                )
            })}

            {transactions.length === 0 &&
                <div className='DataContractsList__EmptyMessage'>There are no data contracts created yet.</div>
            }

        </div>
    );
}
