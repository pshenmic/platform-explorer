import {Link} from "react-router-dom";
import BlocksListItem from './BlocksListItem'
import './BlocksList.scss'


function BlocksList ({blocks = [], columnsCount = 1, size = 'l'}) {
    return( 
        <div 
            className={'BlocksList'}
            style={{
                columnCount: blocks.length > 1 ? columnsCount : 1,
            }}
        >
            {blocks.map((block) =>
                <BlocksListItem
                    key={block.hash}
                    block={block}
                    size={size}
                />
            )}

            {blocks.length === 0 &&
                <div className={'documents_list__empty_message'}>There are no documents created yet.</div>
            }
        </div>
    )
}

export default BlocksList;