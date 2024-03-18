import Link from 'next/link'
import './DocumentsListItem.scss'


export default function DocumentsListItem({document}) {
    const {identifier, timestamp} = document

    return (
        <Link 
            href={`/document/${identifier}`}
            className={'DocumentsListItem'}
        >

            <div className={'DocumentsListItem__Identifier'}>
                {identifier}
            </div>

            <div className={'DocumentsListItem__Timestamp'}>
                {new Date(timestamp).toLocaleString()}
            </div>

        </Link>
    )
}