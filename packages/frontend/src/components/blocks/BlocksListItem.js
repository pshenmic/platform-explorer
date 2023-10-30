import {Link} from "react-router-dom";
import './BlocksListItem.scss'
import Identifier from '../Identifier'


function BlocksListItem ({ hash, height = '', timestamp, txsLength, size = 'l' }) {
    let hashMaxSymbols = -1;

    switch (size) {
        case 'm':
            hashMaxSymbols = 6;
            break;
        case 's':
            hashMaxSymbols = 6;
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
                    <Identifier value={hash} maxSymbols={hashMaxSymbols}/>
                </span>
            }

            {(typeof txsLength === 'number' || typeof txsLength === 'string') &&
                <span className={"BlocksListItem__Txs"}>
                    ({txsLength} txs)
                </span>
            }
            
        </Link>
    )
}

export default BlocksListItem;