import {Link} from "react-router-dom";
import Identifier from '../Identifier'
import './DocumentsListItem.scss'


export default function DocumentsListItem({identifier}) {
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