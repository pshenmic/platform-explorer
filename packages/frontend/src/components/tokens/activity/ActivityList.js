import Link from 'next/link'
import ActivityListItem from './ActivityListItem'
import { EmptyListMessage } from '../../ui/lists'
import { Grid, GridItem, useBreakpointValue } from '@chakra-ui/react'
import { LoadingList } from '../../loading'
import Pagination from '../../pagination'
import { ErrorMessageBlock } from '../../Errors'
import './ActivityList.scss'

export default function ActivityList ({
  activities = [],
  showMoreLink,
  headerStyles = 'default',
  rate,
  pagination,
  loading,
  itemsCount = 10
}) {
  const isLargeScreen = useBreakpointValue({ base: true, lg: false })
  const headerExtraClass = {
    default: '',
    light: 'ActivityList__ColumnTitles--Light'
  }

  return (
    <div className={'ActivityList'}>
      <div className={'ActivityList__ScrollZone'}>
        <Grid className={`ActivityList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
          <GridItem className={'ActivityList__ColumnTitle ActivityList__ColumnTitle--Timestamp'}>
            Time
          </GridItem>
          <GridItem className={'ActivityList__ColumnTitle ActivityList__ColumnTitle--Hash'}>
            Hash
          </GridItem>
          <GridItem className={'ActivityList__ColumnTitle ActivityList__ColumnTitle--Creator'}>
            Owner
          </GridItem>
          <GridItem className={'ActivityList__ColumnTitle ActivityList__ColumnTitle--Recipient'}>
            Recipient
          </GridItem>
          <GridItem className={'ActivityList__ColumnTitle ActivityList__ColumnTitle--Amount'}>
            Amount {!isLargeScreen && <>Tokens</>}
          </GridItem>
          <GridItem className={'ActivityList__ColumnTitle ActivityList__ColumnTitle--Type'}>
            Type
          </GridItem>
        </Grid>

        {!loading
          ? <div className={'ActivityList__Items'}>
              {activities?.map((activity, key) => (
                <ActivityListItem
                  key={key}
                  activity={activity}
                  rate={rate}
                />
              ))}
              {activities?.length === 0 &&
                <EmptyListMessage>There are no activities yet.</EmptyListMessage>
              }
              {activities === undefined && <ErrorMessageBlock/>}
            </div>
          : <LoadingList itemsCount={itemsCount}/>
        }
      </div>

      {pagination &&
        <Pagination
          className={'ActivityList__Pagination'}
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount}
          forcePage={pagination.forcePage}
          justify={true}
        />
      }

      {showMoreLink &&
        <Link href={showMoreLink} className={'SimpleList__ShowMoreButton'}>Show more</Link>
      }
    </div>
  )
}
