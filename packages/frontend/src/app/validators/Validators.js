'use client'

import * as Api from '../../util/Api'
import TokensList from '../../components/tokens/TokensList'
import Pagination from '../../components/pagination'
import { ErrorMessageBlock } from '@components/Errors'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { useQuery } from '@tanstack/react-query'
import { useQueryState, parseAsInteger } from 'nuqs'
import { normalizePagination } from '@utils/table'
import {
  Container,
  Heading,
  Box,
  useBreakpointValue
} from '@chakra-ui/react'
import { useTokensFilters, TokenFilters } from '@components/tokens'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function Tokens () {
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { filters, setFilters } = useTokensFilters()

  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger
      .withDefault(paginateConfig.defaultPage)
      .withOptions({ scroll: false, shallow: true })
  )
  const [pageSize, setPageSize] = useQueryState(
    'page-size',
    parseAsInteger
      .withDefault(paginateConfig.pageSize.default)
      .withOptions({ scroll: false, shallow: true })
  )

  const tokens = useQuery({
    queryKey: ['tokens', page, pageSize, ...Object.values(filters)],
    queryFn: () => Api.getTokens(
      page,
      pageSize,
      'asc',
      filters
    ),
    keepPreviousData: true,
    select: ({ pagination, ...other }) => ({
      ...other,
      pagination: normalizePagination({
        page,
        pageSize,
        ...pagination
      })
    })
  })

  const pagination = tokens.data?.pagination

  const handleFiltersChange = (next) => {
    setFilters(next)
    setPage(1)
  }

  return (
    <Container
      maxW={'container.maxPageW'}
      mt={8}
      className={'Transactions'}
    >
      <Container
        maxW={'container.maxPageW'}
        className={'InfoBlock'}
      >
        <Heading className={'InfoBlock__Title'} as={'h1'}>Tokens</Heading>

        <TokenFilters
          onFilterChange={handleFiltersChange}
          isMobile={isMobile}
          className={'TokensIntro__Filters'}
        />

        {!tokens.isError
          ? <TokensList
              tokens={tokens.data?.resultSet}
              loading={tokens.isLoading}
              itemsCount={pageSize}
            />
          : <Container h={20}><ErrorMessageBlock/></Container>
        }

        {tokens.data?.resultSet?.length > 0 &&
          <div className={'ListNavigation'}>
            <Box display={['none', 'none', 'block']} width={'155px'}/>
            <Pagination
              onPageChange={({ selected }) => setPage((selected || 0) + 1)}
              pageCount={pagination.pageCount}
              forcePage={pagination.forcePage}
            />
            <PageSizeSelector
              PageSizeSelectHandler={e => {
                setPageSize(e.value)
                setPage(1)
              }}
              value={pageSize}
              items={paginateConfig.pageSize.values}
            />
          </div>
        }
      </Container>
    </Container>
  )
}

export default Tokens
