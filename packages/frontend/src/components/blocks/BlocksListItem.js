import {Link} from 'react-router-dom'
import './BlocksListItem.scss'


function BlocksListItem ({ block }) {
    const {header, txs} = block
    const {hash, height, timestamp} = header

    return(
        <Link 
            to={`/block/${hash}`} 
            className={'BlocksListItem'}
        >
            {(typeof height === 'number' && 
                <span className={'BlocksListItem__Height'}>{height}</span>
            )}

            {typeof timestamp === 'string' &&
                <span className={'BlocksListItem__Timestamp'}>
                    {new Date(timestamp).toLocaleString()}
                </span>
            }

            {typeof hash === 'string' &&
                <span className={'BlocksListItem__Hash'}>
                    {hash}  
                </span>
            }

            {(typeof txs.length === 'number') &&
                <span className={'BlocksListItem__Txs'}>
                    ({txs.length} txs)
                </span>
            }
            
        </Link>
    )
}

export default BlocksListItem;