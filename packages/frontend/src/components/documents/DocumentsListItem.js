import {Link} from "react-router-dom";
import Identifier from '../Identifier'
import './DocumentsListItem.scss'


export default function DocumentsListItem({document, size='l'}) {
    const identifier = document.identifier
    const timestamp = document.timestamp

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
        <Link 
            to={`/document/${identifier}`}
            className='DocumentsListItem'
        >

            <div className='DocumentsListItem__Identifier'>
                <Identifier value={identifier} maxSymbols={maxSymbols}/>
            </div>

            <div className='DocumentsListItem__Timestamp'>
                {new Date(timestamp).toLocaleString()}
            </div>

        </Link>
    )
}