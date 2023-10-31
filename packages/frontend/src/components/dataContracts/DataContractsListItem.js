import {Link} from 'react-router-dom';
import './DataContractsListItem.scss'


function DataContractsListItem ({dataContract, size = 'l'}) {
    const identifier = dataContract.identifier
    const timestamp = dataContract.timestamp
    
    return (
        <>
            <Link to={`/dataContract/${identifier}`} className={'DataContractsListItem'}>
                <div className={'DataContractsListItem__Identifier'}>
                    {identifier}
                </div>

                {(size !== 's' && typeof timestamp === 'string') && 
                    <div className={'DataContractsListItem__Timestamp'}>
                        {new Date(timestamp).toLocaleString()}
                    </div>
                }
            </Link>
        </>
    );
}

export default DataContractsListItem;