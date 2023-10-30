import TransactionsListItem from './TransactionsListItem'


export default function TransactionsList({items = []}) {
    return (
        <div>

            {items.map((transaction, key) => {
                if (typeof transaction === 'string') {
                    return (
                        <TransactionsListItem
                            key={key}
                            hash={transaction}
                        />
                    )
                } else {
                    return (
                        <TransactionsListItem
                            key={key}
                            hash={transaction.hash}
                            type={'Doument Batch'}
                            timestamp={transaction.timestamp}
                        />
                    )
                }
            })}

            {items.length === 0 &&
                <div className='DataContractsList__EmptyMessage'>There are no data contracts created yet.</div>
            }

        </div>
    );
}
