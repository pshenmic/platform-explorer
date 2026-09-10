import type { ComponentType } from 'react'
import Link from 'next/link'
import ActivityListItem from './ActivityListItem'
import type { TokenActivity } from './ActivityListItem'
import { EmptyListMessage } from '../../ui/lists'
import { Grid, GridItem, useBreakpointValue } from '@chakra-ui/react'
import { LoadingList as LoadingListJs } from '../../loading'
import PaginationJs from '../../pagination'
import { ErrorMessageBlock } from '../../Errors'
import type { Rate } from '../../../types'
import './ActivityList.css'

const LoadingList = LoadingListJs as ComponentType<{ itemsCount?: number }>
const Pagination = PaginationJs as ComponentType<{
  className?: string
  onPageChange?: (selectedItem: { selected: number }) => void
  pageCount?: number
  forcePage?: number
  justify?: boolean
}>

type HeaderStyles = 'default' | 'light'

interface ListPagination {
  onPageChange: (selectedItem: { selected: number }) => void
  pageCount: number
  forcePage?: number
}

interface ActivityListProps {
  activities?: TokenActivity[]
  showMoreLink?: string
  headerStyles?: HeaderStyles
  rate?: Pick<Rate, 'usd'> | null
  pagination?: ListPagination
  loading?: boolean
  itemsCount?: number
  decimals?: number | null
}

export default function ActivityList ({
  activities = [],
  showMoreLink,
  headerStyles = 'default',
  rate,
  pagination,
  loading,
  itemsCount = 10,
  decimals
}: ActivityListProps) {
  const isLargeScreen = useBreakpointValue({ base: true, lg: false })
  const headerExtraClass: Record<HeaderStyles, string> = {
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
                  decimals={decimals}
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
