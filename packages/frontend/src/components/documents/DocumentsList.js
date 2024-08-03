import DocumentsListItem from './DocumentsListItem'
import { EmptyListMessage } from '../lists'
import './DocumentsList.scss'

export default function DocumentsList ({ documents = [], size = 'l' }) {
  return (
    <div className={'DocumentsList ' + 'DocumentsList--Size' + size.toUpperCase()}>
        {documents.map((document, key) =>
            <DocumentsListItem
                key={key}
                size={size}
                document={document}
            />
        )}

        {documents.length === 0 &&
            <EmptyListMessage>There are no documents created yet.</EmptyListMessage>
        }
    </div>
  )
}
