import {Link} from "react-router-dom";
import './IdentitiesListItem.scss'


function IdentitiesListItem ({identity, size = 'l'}) {
    const identifier = identity.identifier
    const timestamp = identity.timestamp

    return (
        <Link to={`/identity/${identifier}`} className={'IdentitiesListItem'}>
            <div className={'IdentitiesListItem__Identifier'}>
                {identifier}
            </div>

            {(size !== 's' && typeof timestamp === 'string') && 
                <div className={'IdentitiesListItem__Timestamp'}>
                    {new Date(timestamp).toLocaleString()}
                </div>
            }
        </Link>
    );
}

export default IdentitiesListItem;