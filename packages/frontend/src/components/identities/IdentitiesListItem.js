import {Link} from "react-router-dom";
import './IdentitiesListItem.scss'
import Identifier from '../Identifier'


function IdentitiesListItem ({identifier, size = 'l'}) {
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
            <div className="IdentitiesListItem__Balance">120</div>
        </Link>
    );
}

export default IdentitiesListItem;