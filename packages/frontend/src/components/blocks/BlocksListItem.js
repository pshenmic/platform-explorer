import {Link} from "react-router-dom";
import './BlocksListItem.scss'
import Identifier from '../Identifier'


function BlocksListItem ({ block, size = 'l' }) {
    const hash = block.header.hash
    const height = block.header.height
    const timestamp = block.header.timestamp
    const txsLength = block.txs.length

    let maxSymbols = -1;

    switch (size) {
        case 'm':
            maxSymbols = 16;
            break;
        case 's':
            maxSymbols = 12;
            break;
    }

    return(
        <Link to={`/block/${hash}`} className={"BlocksListItem"}>
            {(size === 'l' && 
                <span className={"BlocksListItem__Height"}>{height}</span>
            )}

            {typeof timestamp === 'string' &&
                <span className={"BlocksListItem__Timestamp"}>
                    {new Date(timestamp).toLocaleString()}
                </span>
            }

            {typeof hash === 'string' &&
                <span className={"BlocksListItem__Hash"}>
                    <Identifier value={hash} maxSymbols={maxSymbols}/>
                </span>
            }

            {(typeof txsLength === 'number') &&
                <span className={"BlocksListItem__Txs"}>
                    ({txsLength} txs)
                </span>
            }
            
        </Link>
    )
}

export default BlocksListItem;