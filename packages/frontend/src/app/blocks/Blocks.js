'use client'

import * as Api from '../../util/Api'
import { useState, useEffect, useRef } from 'react'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import BlocksList from '../../components/blocks/BlocksList'
import { LoadingList } from '../../components/loading'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Container,
  Heading,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useBreakpointValue,
  useOutsideClick
} from '@chakra-ui/react'
import { BlocksFilter } from '../../components/blocks'
import { SearchResultsList, GlobalSearchInput } from '../../components/search'
import './Blocks.scss'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

const defaultSearchState = {
  results: { data: {}, loading: false, error: false },
  value: ''
}

function Blocks ({ defaultPage = 1, defaultPageSize }) {
  const [blocks, setBlocks] = useState({ data: {}, loading: true, error: false })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const pageCount = Math.ceil(total / pageSize) ? Math.ceil(total / pageSize) : 1
  const [filters, setFilters] = useState({})
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const menuRef = useRef(null)
  const searchContentRef = useRef(null)
  const [searchState, setSearchState] = useState(defaultSearchState)
  const [searchFocused, setSearchFocused] = useState(false)
  const displayResults =
    Object.keys(searchState.results?.data).length ||
    searchState.results?.loading ||
    searchState.results?.error

  const filtersChangeHandler = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(0)
  }

  const closeSearchHandler = (e) => {
    if (searchContentRef.current && !searchContentRef.current.contains(e?.target)) {
      setSearchFocused(false)
    }
  }

  useEffect(() => {
    setBlocks(prev => ({ ...prev, loading: true, error: null }))

    const fetchData = async () => {
      Api.getBlocks(
        Math.max(1, currentPage + 1),
        Math.max(1, pageSize),
        'desc',
        filters
      ).then(res => {
        setTotal(res.pagination.total)
        fetchHandlerSuccess(setBlocks, res)
      }).catch(err => {
        setTotal(0)
        fetchHandlerError(setBlocks, err)
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

  useOutsideClick({
    ref: menuRef,
    handler: closeSearchHandler
  })

  return (
    <Container
      maxW={'container.maxPageW'}
      color={'white'}
      mt={8}
      mb={8}
      className={'Blocks'}
    >
      <Container
        maxW={'container.maxPageW'}
        _dark={{ color: 'white' }}
        className={'InfoBlock'}
      >
        <Heading className={'InfoBlock__Title'} as={'h1'}>Blocks</Heading>

        <div className={'Blocks__Controls'}>
          <BlocksFilter
            onFilterChange={filtersChangeHandler}
            isMobile={isMobile}
            className={'Blocks__Filters'}
          />

          <div className={'Blocks__SearchWrapper'}>
            <div
              onClick={() => setSearchFocused(true)}
              ref={menuRef}
            >
              <GlobalSearchInput
                forceValue={searchState.value}
                onResultChange={results => setSearchState(prevState => ({ ...prevState, results }))}
                onChange={value => setSearchState(prevState => ({ ...prevState, value }))}
                categoryFilters={['blocks']}
                placeholder={'SEARCH BY BLOCK HASH…'}
              />
            </div>

            <Popover
              closeOnBlur={true}
              placement={'bottom'}
              variant={'menu'}
              isOpen={displayResults && searchFocused}
            >
              <PopoverTrigger>
                <div></div>
              </PopoverTrigger>
              <PopoverContent
                width={'auto'}
                minWidth={'220px'}
                ref={searchContentRef}
              >
                <PopoverBody overflow={'visible'} minW={'300px'}>
                  <div className={'SearchFilter__ResultsContainer'}>
                    <SearchResultsList results={searchState.results}/>
                  </div>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {!blocks.error
          ? <>
              {!blocks.loading
                ? <BlocksList blocks={blocks.data.resultSet}/>
                : <LoadingList itemsCount={pageSize}/>
              }
            </>
          : <Container h={20}><ErrorMessageBlock/></Container>}

        {blocks.data?.resultSet?.length > 0 &&
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

export default Blocks
