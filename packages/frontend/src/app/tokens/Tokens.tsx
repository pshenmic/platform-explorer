'use client'

import * as Api from '../../util/Api'
import TokensList from '../../components/tokens/TokensList'
import TokensTrending from '../../components/tokens/TokensTrending'
import Pagination from '../../components/pagination'
import { ErrorMessageBlock } from '@components/Errors'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useQueryState, parseAsInteger } from 'nuqs'
import { normalizePagination } from '@utils/table'
import {
  Container,
  Box,
  useBreakpointValue
} from '@chakra-ui/react'
import { useTokensFilters, TokenFilters } from '@components/tokens'
import PageTitle from '../../components/intro/PageTitle'
import NetworkStatsInline from '../../components/stats/NetworkStatsInline'
import { formatFullNumber } from '../../util'
import introContent from './intro.md'

import './Tokens.scss'

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
      filters as never
    ),
    placeholderData: keepPreviousData,
    select: ({ pagination, ...other }) => ({
      ...other,
      total: pagination?.total,
      pagination: normalizePagination({
        ...pagination,
        page,
        pageSize
      })
    })
  })

  const pagination = tokens.data?.pagination
  const totalTokens = tokens.data?.total

  const handleFiltersChange = (next: Parameters<typeof setFilters>[0]) => {
    setFilters(next)
    void setPage(1)
  }

  return (
    <Container
      maxW={'container.maxPageW'}
      mt={8}
      className={'Tokens'}
    >
      <Container
        maxW={'container.maxPageW'}
        className={'InfoBlock'}
      >
        <div className={'Tokens__Controls'}>
          <PageTitle title={'Tokens'} description={introContent} className={'Tokens__Title'}/>

          <NetworkStatsInline
            className={'Tokens__Stats'}
            items={[{ label: 'Total', value: typeof totalTokens === 'number' ? formatFullNumber(totalTokens) as string | number : null, loading: tokens.isLoading }]}
          />

          <TokensTrending className={'Tokens__Trending'}/>

          <TokenFilters
            onFilterChange={handleFiltersChange}
            isMobile={isMobile}
            className={'Tokens__Filters'}
          />
        </div>

        {!tokens.isError
          ? <TokensList
              tokens={tokens.data?.resultSet as never}
              loading={tokens.isLoading}
              itemsCount={pageSize}
            />
          : <Container h={20}><ErrorMessageBlock/></Container>
        }

        {(tokens.data?.resultSet?.length ?? 0) > 0 &&
          <div className={'ListNavigation'}>
            <Box display={['none', 'none', 'block']} width={'155px'}/>
            <Pagination
              onPageChange={({ selected }) => { void setPage((selected || 0) + 1) }}
              pageCount={pagination?.pageCount ?? 1}
              forcePage={pagination?.forcePage}
            />
            <PageSizeSelector
              PageSizeSelectHandler={e => {
                void setPageSize(Number(e?.value))
                void setPage(1)
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
