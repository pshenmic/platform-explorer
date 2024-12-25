import DocumentsListItem from './DocumentsListItem'
import { EmptyListMessage } from '../ui/lists'
import Pagination from '../pagination'
import { LoadingList } from '../loading'
import { ErrorMessageBlock } from '../Errors'
import './DocumentsList.scss'

export default function DocumentsList ({ documents = [], size = 'l', pagination, loading, itemsCount = 10 }) {
  return (
    <div className={'DocumentsList ' + 'DocumentsList--Size' + size.toUpperCase()}>
      {!loading
        ? <div className={'TransfersList__Items'}>
            {documents?.map((document, key) =>
              <DocumentsListItem
                key={key}
                size={size}
                document={document}
              />
            )}
            {documents?.length === 0 &&
              <EmptyListMessage>There are no documents created yet.</EmptyListMessage>
            }
            {documents === undefined && <ErrorMessageBlock/>}
          </div>
        : <LoadingList itemsCount={itemsCount}/>
      }

      {pagination &&
        <Pagination
          className={'DocumentsList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount}
          forcePage={pagination.forcePage}
          justify={true}
        />
      }
    </div>
  )
}
