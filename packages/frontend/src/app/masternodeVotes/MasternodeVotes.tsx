'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Box, Container, useBreakpointValue } from '@chakra-ui/react'
import { VotesList } from '../../components/contestedResources/votes'
import { MasternodeVotesFilters } from '../../components/contestedResources'
import MasternodeVotesStatsInline from '../../components/contestedResources/MasternodeVotesStatsInline'
import PageTitle from '../../components/intro/PageTitle'
import type { LoadableState, PaginatedResultSet, Vote } from '../../types'
import introContent from './introContent'
import './MasternodeVotes.css'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

type QueryFilters = Record<string, string | number | boolean | string[] | null | undefined>

interface MasternodeVotesProps {
  defaultPage?: number
  defaultPageSize?: number
}

function MasternodeVotes ({ defaultPage = 1, defaultPageSize }: MasternodeVotesProps) {
  const [masternodeVotes, setMasternodeVotes] = useState<LoadableState<PaginatedResultSet<Vote>>>({
    data: {} as PaginatedResultSet<Vote>,
    props: { currentPage: 0 },
    loading: true,
    error: false
  })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const pageCount = Math.ceil(total / pageSize) ? Math.ceil(total / pageSize) : 1
  const [filters, setFilters] = useState<QueryFilters>({})
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isMobile = useBreakpointValue({ base: true, md: false })

  const filtersChangeHandler = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters as QueryFilters)
    setCurrentPage(0)
  }

  useEffect(() => {
    setMasternodeVotes(prev => ({ ...prev, loading: true, error: false }))

    const fetchData = async () => {
      Api.getMasternodeVotes(
        Math.max(1, currentPage + 1),
        Math.max(1, pageSize),
        'desc',
        filters
      ).then(res => {
        setTotal(res?.pagination?.total)
        fetchHandlerSuccess(setMasternodeVotes, res)
      }).catch(err => {
        setTotal(0)
        fetchHandlerError(setMasternodeVotes, err)
      })
    }

    fetchData()
  }, [currentPage, pageSize, filters])

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '', 10) || paginateConfig.defaultPage
    setCurrentPage(Math.max(page - 1, 0))
    setPageSize(parseInt(searchParams.get('page-size') || '', 10) || paginateConfig.pageSize.default)
  }, [searchParams, pathname])

  useEffect(() => {
    const urlParameters = new URLSearchParams(Array.from(searchParams.entries()))

    if (currentPage + 1 === paginateConfig.defaultPage && pageSize === paginateConfig.pageSize.default) {
      urlParameters.delete('page')
      urlParameters.delete('page-size')
    } else {
      urlParameters.set('page', String(currentPage + 1))
      urlParameters.set('page-size', String(pageSize))
    }

    router.push(`${pathname}?${urlParameters.toString()}`, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize])

  return (
    <Container
      maxW={'container.maxPageW'}
      color={'white'}
      mt={8}
      mb={8}
      className={'MasternodeVotes'}
    >
      <Container
        maxW={'container.maxPageW'}
        _dark={{ color: 'white' }}
        className={'InfoBlock'}
      >
        <div className={'MasternodeVotes__Controls'}>
          <PageTitle title={'Masternode Votes'} description={introContent} className={'MasternodeVotes__Title'}/>

          <MasternodeVotesStatsInline className={'MasternodeVotes__Stats'} total={total}/>

          <MasternodeVotesFilters
            onFilterChange={filtersChangeHandler}
            isMobile={isMobile}
            className={'MasternodeVotes__Filters'}
          />
        </div>

        {!masternodeVotes.error
          ? <VotesList
              votes={masternodeVotes.data?.resultSet as never}
              itemsCount={pageSize}
              loading={masternodeVotes.loading}
            />
          : <Container h={20}><ErrorMessageBlock/></Container>}

        {(masternodeVotes.data?.resultSet?.length ?? 0) > 0 &&
          <div className={'ListNavigation'}>
            <Box display={['none', 'none', 'block']} width={'210px'}/>
            <Pagination
              onPageChange={({ selected }) => setCurrentPage(selected)}
              pageCount={pageCount}
              forcePage={currentPage}
            />
            <PageSizeSelector
              PageSizeSelectHandler={e => setPageSize(Number(e?.value))}
              value={pageSize}
              items={paginateConfig.pageSize.values}
            />
          </div>
        }
      </Container>
    </Container>
  )
}

export default MasternodeVotes
