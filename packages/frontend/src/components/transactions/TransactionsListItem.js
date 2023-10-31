import {Link} from 'react-router-dom'
import {getTransitionTypeString} from '../../util/index'
import './TransactionsListItem.scss'


function TransactionsListItem({transaction}) {
    const hash = typeof transaction === 'object' ? transaction.hash : transaction;
    const {timestamp, type} = transaction

    return (
        <Link 
            to={`/transaction/${hash}`}
            className={'TransactionsListItem'}
        >

            {typeof timestamp === 'string' &&
                <div className={'TransactionsListItem__Timestamp'}>
                    {new Date(timestamp).toLocaleString()}
                </div>
            }
            
            {typeof hash === 'string' &&
                <div className={'TransactionsListItem__Identifier'}>
                    {hash}
                </div>
            }

            {typeof type === 'number' &&
                <div className={'TransactionsListItem__Type'}>
                    ({getTransitionTypeString(type)})
                </div>
            }

        </Link>
    )
}

export default TransactionsListItem;