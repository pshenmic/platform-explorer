import {Link} from 'react-router-dom';
import './BlocksListItem.scss'


function BlocksListItem ({ block, size = 'l' }) {
    const hash = block.header.hash
    const height = block.header.height
    const timestamp = block.header.timestamp
    const txsLength = block.txs.length

    return(
        <Link to={`/block/${hash}`} className={'BlocksListItem'}>
            {(size === 'l' && 
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

            {(typeof txsLength === 'number') &&
                <span className={'BlocksListItem__Txs'}>
                    ({txsLength} txs)
                </span>
            }
            
        </Link>
    )
}

export default BlocksListItem;