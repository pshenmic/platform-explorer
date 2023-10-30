import {Link} from "react-router-dom";
import Identifier from '../Identifier'
import './DocumentsListItem.scss'


export default function DocumentsListItem({document}) {
    const identifier = document.identifier

    return (
        <Link 
            to={`/document/${identifier}`}
            className='DocumentsListItem'
        >

            <div className='DocumentsListItem__Identifier'>
                <Identifier value={identifier}/>
            </div>

        </Link>
    )
}