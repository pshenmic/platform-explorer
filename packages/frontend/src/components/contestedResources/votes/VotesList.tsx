import { EmptyListMessage } from '../../ui/lists'
import { ErrorMessageBlock } from '../../Errors'
import { LoadingList } from '../../loading'
import Pagination from '../../pagination'
import { VotesListItem } from './'
import type { Vote } from '../../../types'
import './VotesList.css'

interface PaginationProps {
  onPageChange: (selectedItem: { selected: number }) => void
  pageCount: number
  forcePage?: number
}

interface VotesListProps {
  votes?: Vote[]
  headerStyles?: string
  pagination?: PaginationProps | null
  loading?: boolean
  itemsCount?: number
  showDataContract?: boolean
}

function VotesList({
  votes = [],
  headerStyles,
  pagination,
  loading,
  itemsCount = 10,
  showDataContract = true
}: VotesListProps) {
  const headerExtraClass: Record<string, string> = {
    default: '',
    light: 'VotesList__ColumnTitles--Light',
    noDataContract: 'VotesList__ColumnTitles--NoDataContract'
  }

  return (
    <div className={'VotesList'}>
      <div className={'VotesList__ListContainer'}>
        <div className={'VotesList__ScrollZone'}>
          <div
            className={`VotesList__ColumnTitles ${headerExtraClass?.[headerStyles ?? ''] || ''} ${!showDataContract ? headerExtraClass.noDataContract : ''}`}
          >
            <div className={'VotesList__ColumnTitle VotesList__ColumnTitle--Timestamp'}>
              Time
            </div>
            <div className={'VotesList__ColumnTitle VotesList__ColumnTitle--ProTxHash'}>
              Voter Pro Tx Hash
            </div>
            {showDataContract && (
              <div className={'VotesList__ColumnTitle VotesList__ColumnTitle--DataContract'}>
                Data Contract
              </div>
            )}
            <div className={'VotesList__ColumnTitle VotesList__ColumnTitle--Document'}>
              Document
            </div>
            <div className={'VotesList__ColumnTitle VotesList__ColumnTitle--TowardsIdentity'}>
              Towards Identity
            </div>
            <div className={'VotesList__ColumnTitle VotesList__ColumnTitle--Choice'}>
              Choice
            </div>
            <div className={'VotesList__ColumnTitle VotesList__ColumnTitle--Power'}>
              Power
            </div>
          </div>

          {!loading ? (
            <div className={'VotesList__Items'}>
              {votes?.map((vote, i) => (
                <VotesListItem vote={vote} showDataContract={showDataContract} key={i} />
              ))}
              {votes?.length === 0 && <EmptyListMessage>There are no votes yet.</EmptyListMessage>}
              {votes === undefined && <ErrorMessageBlock />}
            </div>
          ) : (
            <LoadingList itemsCount={itemsCount} />
          )}
        </div>
      </div>

      {pagination && (
        <Pagination
          className={'VotesList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount}
          forcePage={pagination.forcePage}
          justify={true}
        />
      )}
    </div>
  )
}

export default VotesList
