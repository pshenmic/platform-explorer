import './TransactionsListItem.scss'
import {Link} from "react-router-dom";
import Identifier from '../Identifier'
import {getTransitionTypeString} from '../../util/index'


function TransactionsListItem({transaction, size='l'}) {
    const hash = typeof transaction === 'object' ? transaction.hash : transaction;
    const timestamp = transaction.timestamp;
    const type = transaction.type;

    let maxSymbols = -1;

    switch (size) {
        case 'm':
            maxSymbols = 16;
        break;
        case 's':
            maxSymbols = 12;
        break;
    }

    return (
        <Link 
            to={`/transaction/${hash}`}
            className='TransactionsListItem'

        >

            {typeof timestamp === 'string' &&
                <div className='TransactionsListItem__Timestamp'>
                    {new Date(timestamp).toLocaleString()}
                </div>
            }
            
            {typeof hash === 'string' &&
                <div className='TransactionsListItem__Identifier'>
                    <Identifier value={hash} maxSymbols={maxSymbols}/>
                </div>
            }

            {typeof type === 'number' &&
                <div className='TransactionsListItem__Type'>
                    ({getTransitionTypeString(type)})
                </div>
            }

        </Link>
    )
}

export default TransactionsListItem;