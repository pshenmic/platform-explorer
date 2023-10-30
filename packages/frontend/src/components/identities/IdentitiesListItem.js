import {Link} from "react-router-dom";
import './IdentitiesListItem.scss'
import Identifier from '../Identifier'


function IdentitiesListItem ({identity, size = 'l'}) {
    const identifier = identity.identifier
    const timestamp = identity.timestamp

    let maxSymbols = -1;

    switch (size) {
        case 'm':
            maxSymbols = 12;
        break;
        case 's':
            maxSymbols = 6;
        break;
    }
    
    return (
        <Link to={`/identity/${identifier}`} className="IdentitiesListItem">
            <div className="IdentitiesListItem__Identifier">
                <Identifier value={identifier} maxSymbols={maxSymbols}/>
            </div>

            {(size !== 's' && typeof timestamp === 'string') && 
                <div className="IdentitiesListItem__Timestamp">
                    {new Date(timestamp).toLocaleString()}
                </div>
            }
        </Link>
    );
}

export default IdentitiesListItem;