import {Link} from "react-router-dom";
import Identifier from '../Identifier'
import './DataContractsListItem.scss'


function DataContractsListItem ({identifier, size = 'l'}) {
    let maxSymbols = -1;

    switch (size) {
        case 'm':
            maxSymbols = 6;
        break;
        case 's':
            maxSymbols = 3;
        break;
    }

    return (
        <>
            {typeof identifier === 'string' &&
                <Link to={`/dataContract/${identifier}`} className="DataContractsListItem">
                <div className="DataContractsListItem__Identifier">
                    <Identifier value={identifier} maxSymbols={maxSymbols}/>
                </div>
            </Link>
            }
        </>
    );
}

export default DataContractsListItem;