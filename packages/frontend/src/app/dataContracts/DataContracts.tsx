'use client'

import * as Api from '../../util/Api'
import DataContractsList from '../../components/dataContracts/DataContractsList'
import Pagination from '../../components/pagination'
import { ErrorMessageBlock } from '@components/Errors'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useQueryState, parseAsInteger } from 'nuqs'
import { normalizePagination } from '@utils/table'

import { useIsMobile } from '../../hooks'
import { useDataContractsFilters, useDataContractsSorting } from '@components/dataContracts/hooks'
import { DataContractsFilter } from '@components/dataContracts/DataContractsFilter'
import DataContractsStatsInline from '@components/dataContracts/DataContractsStatsInline'
import PageTitle from '../../components/intro/PageTitle'
import introContent from './introContent'
import './DataContractsPage.css'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function DataContractsLayout() {
  const isMobile = useIsMobile()
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
    queryFn: () =>
      Api.getDataContracts(
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
    queryFn: () =>
      Api.getDataContracts(1, 12, sorting.order as 'asc' | 'desc', sorting.orderBy, {
        is_system: 'true'
      }),
    placeholderData: keepPreviousData,
    enabled: showPinnedSystem
  })

  const pinnedGroup = showPinnedSystem
    ? { label: 'System contracts', items: systemContracts.data?.resultSet || [] }
    : null

  const pagination = dataContracts.data?.pagination

  const handleFiltersChange = (next: Parameters<typeof setFilters>[0]) => {
    setFilters(next)
    setPage(1)
  }

  return (
    <div className={'ListPage DataContractsPage'}>
      <div className={'InfoBlock'}>
        <div className={'DataContractsPage__Controls'}>
          <PageTitle
            title={'Data contracts'}
            description={introContent}
            className={'DataContractsPage__Title'}
          />

          <DataContractsStatsInline className={'DataContractsPage__Stats'} />

          <DataContractsFilter
            onFilterChange={handleFiltersChange}
            isMobile={isMobile}
            className={'DataContractsPage__Filters'}
          />
        </div>

        {!dataContracts.isError ? (
          <DataContractsList
            dataContracts={dataContracts.data?.resultSet}
            loading={dataContracts.isLoading}
            itemsCount={pageSize}
            pinnedGroup={pinnedGroup as never}
          />
        ) : (
          <div className={'ListPage__Error'}>
            <ErrorMessageBlock />
          </div>
        )}

        {(dataContracts.data?.resultSet?.length ?? 0) > 0 && (
          <div className={'ListNavigation'}>
            <div className={'ListNavigation__Balance'} />
            <Pagination
              onPageChange={({ selected }) => {
                setPage((selected || 0) + 1)
              }}
              pageCount={pagination?.pageCount ?? 1}
              forcePage={pagination?.forcePage}
            />
            <PageSizeSelector
              PageSizeSelectHandler={e => {
                setPageSize(Number(e?.value))
              }}
              value={pageSize}
              items={paginateConfig.pageSize.values}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default DataContractsLayout
