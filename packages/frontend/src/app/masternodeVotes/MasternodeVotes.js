'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Box, Container, Heading, useBreakpointValue } from '@chakra-ui/react'
import { VotesList } from '../../components/contestedResources/votes'
import { MasternodeVotesFilters } from '../../components/contestedResources'
import './MasternodeVotes.scss'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function MasternodeVotes ({ defaultPage = 1, defaultPageSize }) {
  const [masternodeVotes, setMasternodeVotes] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const pageCount = Math.ceil(total / pageSize) ? Math.ceil(total / pageSize) : 1
  const [filters, setFilters] = useState({})
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isMobile = useBreakpointValue({ base: true, md: false })

  const filtersChangeHandler = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(0)
  }

  useEffect(() => {
    setMasternodeVotes(prev => ({ ...prev, loading: true, error: null }))

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
    const page = parseInt(searchParams.get('page')) || paginateConfig.defaultPage
    setCurrentPage(Math.max(page - 1, 0))
    setPageSize(parseInt(searchParams.get('page-size')) || paginateConfig.pageSize.default)
  }, [searchParams, pathname])

  useEffect(() => {
    const urlParameters = new URLSearchParams(Array.from(searchParams.entries()))

    if (currentPage + 1 === paginateConfig.defaultPage && pageSize === paginateConfig.pageSize.default) {
      urlParameters.delete('page')
      urlParameters.delete('page-size')
    } else {
      urlParameters.set('page', currentPage + 1)
      urlParameters.set('page-size', pageSize)
    }

    router.push(`${pathname}?${urlParameters.toString()}`, { scroll: false })
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
        <Heading className={'InfoBlock__Title'} as={'h1'}>Masternode Votes</Heading>

        <div className={'MasternodeVotes__Controls'}>
          <MasternodeVotesFilters
            onFilterChange={filtersChangeHandler}
            isMobile={isMobile}
            className={'MasternodeVotes__Filters'}
          />
        </div>

        {!masternodeVotes.error
          ? <VotesList
              votes={masternodeVotes.data?.resultSet}
              itemsCount={pageSize}
              loading={masternodeVotes.loading}
              error={masternodeVotes.error}
            />
          : <Container h={20}><ErrorMessageBlock/></Container>}

        {masternodeVotes.data?.resultSet?.length > 0 &&
          <div className={'ListNavigation'}>
            <Box display={['none', 'none', 'block']} width={'210px'}/>
            <Pagination
              onPageChange={({ selected }) => setCurrentPage(selected)}
              pageCount={pageCount}
              forcePage={currentPage}
            />
            <PageSizeSelector
              PageSizeSelectHandler={e => setPageSize(e.value)}
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
