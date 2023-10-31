import {Link} from "react-router-dom";
import './IdentitiesListItem.scss'


function IdentitiesListItem ({identity}) {
    const {identifier, timestamp} = identity

    return (
        <Link 
            to={`/identity/${identifier}`} 
            className={'IdentitiesListItem'}
        >
            <div className={'IdentitiesListItem__Identifier'}>
                {identifier}
            </div>

            {(typeof timestamp === 'string') && 
                <div className={'IdentitiesListItem__Timestamp'}>
                    {new Date(timestamp).toLocaleString()}
                </div>
            }
        </Link>
    );
}

export default IdentitiesListItem;