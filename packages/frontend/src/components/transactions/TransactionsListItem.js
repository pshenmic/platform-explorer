import './TransactionsListItem.scss'
import {Link} from "react-router-dom";
import Identifier from '../Identifier'


function TransactionsListItem({hash = '', timestamp, type}) {
    
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
                    <Identifier value={hash}/>
                </div>
            }

            {typeof type === 'string' &&
                <div className='TransactionsListItem__Type'>
                    ({type})
                </div>
            }

        </Link>
    )
}

export default TransactionsListItem;