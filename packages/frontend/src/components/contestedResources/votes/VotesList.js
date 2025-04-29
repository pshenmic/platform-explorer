import { Grid, GridItem } from '@chakra-ui/react'
import { EmptyListMessage } from '../../ui/lists'
import { ErrorMessageBlock } from '../../Errors'
import { LoadingList } from '../../loading'
import Pagination from '../../pagination'
import { VotesListItem } from './'
import './VotesList.scss'

function VotesList ({ votes = [], headerStyles, pagination, loading, itemsCount = 10, showDataContract = true }) {
  const headerExtraClass = {
    default: '',
    light: 'VotesList__ColumnTitles--Light',
    noDataContract: 'VotesList__ColumnTitles--NoDataContract'
  }

  return (
    <div className={'VotesList'}>
      <div className={'VotesList__ListContainer'}>
        <div className={'VotesList__ScrollZone'}>
          <Grid className={`VotesList__ColumnTitles ${headerExtraClass?.[headerStyles] || ''} ${!showDataContract ? headerExtraClass.noDataContract : ''}`}>
            <GridItem className={'VotesList__ColumnTitle VotesList__ColumnTitle--Timestamp'}>
              Time
            </GridItem>
            <GridItem className={'VotesList__ColumnTitle VotesList__ColumnTitle--ProTxHash'}>
              Voter Pro Tx Hash
            </GridItem>
            {showDataContract &&
              <GridItem className={'VotesList__ColumnTitle VotesList__ColumnTitle--DataContract'}>
                Data Contract
              </GridItem>
            }
            <GridItem className={'VotesList__ColumnTitle VotesList__ColumnTitle--Document'}>
              Document
            </GridItem>
            <GridItem className={'VotesList__ColumnTitle VotesList__ColumnTitle--TowardsIdentity'}>
              Towards Identity
            </GridItem>
            <GridItem className={'VotesList__ColumnTitle VotesList__ColumnTitle--Choice'}>
              Choice
            </GridItem>
            <GridItem className={'VotesList__ColumnTitle VotesList__ColumnTitle--Power'}>
              Power
            </GridItem>
          </Grid>

          {!loading
            ? <div className={'VotesList__Items'}>
              {votes?.map((vote, i) =>
                <VotesListItem vote={vote} showDataContract={showDataContract} key={i}/>
              )}
              {votes?.length === 0 &&
                <EmptyListMessage>There are no votes yet.</EmptyListMessage>
              }
              {votes === undefined && <ErrorMessageBlock/>}
            </div>
            : <LoadingList itemsCount={itemsCount}/>
          }
        </div>
      </div>

      {pagination &&
        <Pagination
          className={'VotesList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount}
          forcePage={pagination.forcePage}
          justify={true}
        />
      }
    </div>
  )
}

export default VotesList
