'use client'

import * as Api from '../../util/Api'
import DataContractsList from '../../components/dataContracts/DataContractsList'
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
import { useDataContractsFilters, useDataContractsSorting } from '@components/dataContracts/hooks'
import { DataContractsFilter } from '@components/dataContracts/DataContractsFilter'
import DataContractsStatsInline from '@components/dataContracts/DataContractsStatsInline'
import PageTitle from '../../components/intro/PageTitle'
import introContent from './intro.md'
import './DataContractsPage.scss'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function DataContractsLayout () {
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { sorting } = useDataContractsSorting()
  const { filters, setFilters } = useDataContractsFilters()
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

  const showPinnedSystem = !filters.is_system
  const listFilters = showPinnedSystem ? { ...filters, is_system: 'false' } : filters

  const dataContracts = useQuery({
    queryKey: ['dataContracts', page, pageSize, ...Object.values(listFilters)],
    queryFn: () => Api.getDataContracts(
      page,
      pageSize,
      sorting.order as 'asc' | 'desc',
      sorting.orderBy,
      listFilters as never
    ),
    placeholderData: keepPreviousData,
    select: ({ pagination, ...other }) => ({
      ...other,
      pagination: normalizePagination({
        ...pagination,
        page,
        pageSize
      })
    })
  })

  const systemContracts = useQuery({
    queryKey: ['dataContracts', 'system', sorting.order, sorting.orderBy],
    queryFn: () => Api.getDataContracts(1, 12, sorting.order as 'asc' | 'desc', sorting.orderBy, { is_system: 'true' }),
    placeholderData: keepPreviousData,
    enabled: showPinnedSystem
  })

  const pinnedGroup = showPinnedSystem
    ? { label: 'System contracts', items: systemContracts.data?.resultSet || [] }
    : null

  const pagination = dataContracts.data?.pagination

  const handleFiltersChange = (next: Parameters<typeof setFilters>[0]) => {
    setFilters(next)
    void setPage(1)
  }

  return (
    <Container
        maxW={'container.maxPageW'}
        color={'white'}
        mt={8}
        mb={8}
    >
        <Container
            maxW={'container.maxPageW'}
            className={'InfoBlock'}
        >
            <div className={'DataContractsPage__Controls'}>
              <PageTitle title={'Data contracts'} description={introContent} className={'DataContractsPage__Title'}/>

              <DataContractsStatsInline className={'DataContractsPage__Stats'}/>

              <DataContractsFilter
                onFilterChange={handleFiltersChange}
                isMobile={isMobile}
                className={'DataContractsPage__Filters'}
              />
            </div>

            {!dataContracts.isError
              ? <DataContractsList
                  dataContracts={dataContracts.data?.resultSet}
                  loading={dataContracts.isLoading}
                  itemsCount={pageSize}
                  pinnedGroup={pinnedGroup as never}
                />
              : <Container h={20}><ErrorMessageBlock/></Container>
            }

            {(dataContracts.data?.resultSet?.length ?? 0) > 0 &&
              <div className={'ListNavigation'}>
                <Box display={['none', 'none', 'block']} width={'155px'}/>
                <Pagination
                  onPageChange={({ selected }) => { void setPage((selected || 0) + 1) }}
                  pageCount={pagination?.pageCount ?? 1}
                  forcePage={pagination?.forcePage}
                />
                <PageSizeSelector
                  PageSizeSelectHandler={e => { void setPageSize(Number(e?.value)) }}
                  value={pageSize}
                  items={paginateConfig.pageSize.values}
                />
              </div>
            }
        </Container>
    </Container>
  )
}

export default DataContractsLayout
