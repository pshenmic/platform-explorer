import type { Document } from '../../../types'
import DocumentsRevisionsListItem from './DocumentsRevisionsListItem'
import { EmptyListMessage } from '../../ui/lists'
import Pagination from '../../pagination'
import { LoadingList } from '../../loading'
import { ErrorMessageBlock } from '../../Errors'

import './DocumentsRevisionsList.css'

interface DocumentsRevisionsListProps {
  revisions?: Array<Record<string, unknown>>
  headerStyles?: string
  pagination?: {
    onPageChange?: (p: { selected: number }) => void
    pageCount?: number
    forcePage?: number
  } | null
  loading?: boolean
  itemsCount?: number
}

export default function DocumentsRevisionsList({
  revisions = [],
  headerStyles,
  pagination,
  loading,
  itemsCount = 10
}: DocumentsRevisionsListProps) {
  const headerExtraClass: Record<string, string> = {
    default: '',
    light: 'DocumentsRevisionsList__ColumnTitles--Light'
  }

  return (
    <div className={'DocumentsRevisionsList'}>
      <div
        className={`DocumentsRevisionsList__ColumnTitles ${headerExtraClass[headerStyles ?? 'default'] || ''}`}
      >
        <div
          className={
            'DocumentsRevisionsList__ColumnTitle DocumentsRevisionsList__ColumnTitle--Timestamp'
          }
        >
          Time
        </div>
        <div
          className={
            'DocumentsRevisionsList__ColumnTitle DocumentsRevisionsList__ColumnTitle--TxHash'
          }
        >
          Tx Hash
        </div>
        <div
          className={
            'DocumentsRevisionsList__ColumnTitle DocumentsRevisionsList__ColumnTitle--Owner'
          }
        >
          Owner
        </div>
        <div
          className={
            'DocumentsRevisionsList__ColumnTitle DocumentsRevisionsList__ColumnTitle--GasUsed'
          }
        >
          Gas Used
        </div>
        <div
          className={
            'DocumentsRevisionsList__ColumnTitle DocumentsRevisionsList__ColumnTitle--TransitionType'
          }
        >
          Transition
        </div>
        <div
          className={
            'DocumentsRevisionsList__ColumnTitle DocumentsRevisionsList__ColumnTitle--Revision'
          }
        >
          Revision
        </div>
      </div>

      {!loading ? (
        <div className={'DocumentsRevisionsList__Items'}>
          {revisions?.map((revision, key) => (
            <DocumentsRevisionsListItem revision={revision} key={key} />
          ))}
          {revisions?.length === 0 && (
            <EmptyListMessage>There are no documents created yet.</EmptyListMessage>
          )}
          {revisions === undefined && <ErrorMessageBlock />}
        </div>
      ) : (
        <LoadingList itemsCount={itemsCount} />
      )}

      {pagination && (
        <Pagination
          className={'DocumentsRevisionsList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount ?? 0}
          forcePage={pagination.forcePage ?? 0}
          justify={true}
        />
      )}
    </div>
  )
}
