import { EmptyListMessage } from '../ui/lists'
import { ErrorMessageBlock } from '../Errors'
import { LoadingList } from '../loading'
import Pagination from '../pagination'
import { ContestedResourcesListItem } from './ContestedResourcesListItem'
import type { ContestedResourcesListItemData } from './ContestedResourcesListItem'
import './ContestedResourcesList.css'

interface PaginationProps {
  onPageChange: (selectedItem: { selected: number }) => void
  pageCount: number
  forcePage?: number
}

interface ContestedResourcesListProps {
  contestedResources?: ContestedResourcesListItemData[]
  headerStyles?: string
  pagination?: PaginationProps | null
  loading?: boolean
  itemsCount?: number
}

function ContestedResourcesList({
  contestedResources = [],
  headerStyles,
  pagination,
  loading,
  itemsCount = 10
}: ContestedResourcesListProps) {
  const headerExtraClass: Record<string, string> = {
    default: '',
    light: 'ContestedResourcesList__ColumnTitles--Light'
  }

  return (
    <div className={'ContestedResourcesList'}>
      <div
        className={`ContestedResourcesList__ColumnTitles ${headerExtraClass?.[headerStyles ?? ''] || ''}`}
      >
        <div className={'ContestedResourcesList__ColumnTitle'}>Time</div>
        <div className={'ContestedResourcesList__ColumnTitle'}>Resource Value</div>
        <div
          className={
            'ContestedResourcesList__ColumnTitle ContestedResourcesList__ColumnTitle--DataContract'
          }
        >
          Data Contract
        </div>
        <div
          className={
            'ContestedResourcesList__ColumnTitle ContestedResourcesList__ColumnTitle--IndexName'
          }
        >
          Index name
        </div>
        <div
          className={
            'ContestedResourcesList__ColumnTitle ContestedResourcesList__ColumnTitle--DocumentType'
          }
        >
          Document type
        </div>
        <div
          className={
            'ContestedResourcesList__ColumnTitle ContestedResourcesList__ColumnTitle--Votes'
          }
        >
          Votes
        </div>
        <div
          className={
            'ContestedResourcesList__ColumnTitle ContestedResourcesList__ColumnTitle--EndsIn'
          }
        >
          Ends in
        </div>
      </div>

      {!loading ? (
        <div className={'ContestedResourcesList__Items'}>
          {contestedResources?.map((contestedResource, i) => (
            <ContestedResourcesListItem contestedResource={contestedResource} key={i} />
          ))}
          {contestedResources?.length === 0 && (
            <EmptyListMessage>There are no data contracts created yet.</EmptyListMessage>
          )}
          {contestedResources === undefined && <ErrorMessageBlock />}
        </div>
      ) : (
        <LoadingList itemsCount={itemsCount} />
      )}

      {pagination && (
        <Pagination
          className={'ContestedResourcesList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount}
          forcePage={pagination.forcePage}
          justify={true}
        />
      )}
    </div>
  )
}

export default ContestedResourcesList
