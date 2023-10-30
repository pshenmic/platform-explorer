import {Link} from "react-router-dom";
import Identifier from '../Identifier'
import './DataContractsListItem.scss'


function DataContractsListItem ({dataContract, size = 'l'}) {
    const identifier = dataContract.identifier
    const timestamp = dataContract.timestamp
    
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
        <>
            {typeof identifier === 'string' &&
                <Link to={`/dataContract/${identifier}`} className="DataContractsListItem">
                    <div className="DataContractsListItem__Identifier">
                        <Identifier value={identifier} maxSymbols={maxSymbols}/>
                    </div>

                    {(size !== 's' && typeof timestamp === 'string') && 
                        <div className="DataContractsListItem__Timestamp">
                            {new Date(timestamp).toLocaleString()}
                        </div>
                    }
                </Link>
            }
        </>
    );
}

export default DataContractsListItem;