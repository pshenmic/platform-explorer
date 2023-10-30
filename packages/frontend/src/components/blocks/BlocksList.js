import {Link} from "react-router-dom";
import BlocksListItem from './BlocksListItem'
import './BlocksList.scss'


function BlocksList ({items = [], columnsCount = -1, size = 'l'}) {
    return( 
        <div 
            className='BlocksList'
            style={{
                columnCount: items.length > 1 ? columnsCount : 1,
            }}
        >
            {items.map((block) =>
                <BlocksListItem
                    key={block.hash}
                    hash={block.header.hash}
                    height={block.header.height}
                    timestamp={block.header.timestamp}
                    txsLength={block.txs.length}
                    size={size}
                />
            )}

            {items.length === 0 &&
                <div className='documents_list__empty_message'>There are no documents created yet.</div>
            }
        </div>
    )
}

export default BlocksList;