'use client'

import { useEffect, useRef, useState } from 'react'
import * as Api from '../../util/Api'
import DataContractsList from '../../components/dataContracts/DataContractsList'
import Pagination from '../../components/pagination'
import { ErrorMessageBlock } from '@components/Errors'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useQueryState, parseAsInteger, parseAsBoolean } from 'nuqs'
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
  const [showSystem, setShowSystem] = useQueryState(
    'show-system',
    parseAsBoolean.withDefault(false).withOptions({ scroll: false, shallow: true })
  )

  const pinSystem = showSystem && !filters.is_system
  const listFilters = pinSystem || !showSystem ? { ...filters, is_system: 'false' } : filters

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
    placeholderData: keepPreviousData
  })

  const fetchedSystem = systemContracts.data?.resultSet || []
  const cachedSystem = useRef(fetchedSystem)
  if (fetchedSystem.length > 0) cachedSystem.current = fetchedSystem

  const [enteringKeys, setEnteringKeys] = useState<Set<string>>(() => new Set())
  const [leavingKeys, setLeavingKeys] = useState<Set<string>>(() => new Set())
  const [exitingItems, setExitingItems] = useState<typeof fetchedSystem>([])
  const wasPinned = useRef(false)
  const leaveTimeout = useRef<number | null>(null)
  const enterTimeout = useRef<number | null>(null)

  const idsOf = (items: typeof fetchedSystem) =>
    new Set(items.map(item => item?.identifier).filter(Boolean) as string[])

  const clearTimer = (ref: typeof leaveTimeout) => {
    if (ref.current) {
      window.clearTimeout(ref.current)
      ref.current = null
    }
  }

  const slotDuration = (count: number) => 380 + Math.max(0, count - 1) * 45 + 40

  const startEnter = (items: typeof fetchedSystem) => {
    if (items.length === 0) return
    clearTimer(enterTimeout)
    setEnteringKeys(idsOf(items))
    wasPinned.current = true
    enterTimeout.current = window.setTimeout(() => {
      setEnteringKeys(new Set())
      enterTimeout.current = null
    }, slotDuration(items.length))
  }

  const systemItems = pinSystem ? fetchedSystem : exitingItems
  const pageItems = dataContracts.data?.resultSet || []
  const listItems = systemItems.length > 0 ? [...systemItems, ...pageItems] : pageItems
  const pagination = dataContracts.data?.pagination
  const listTotal =
    typeof pagination?.total === 'number' ? pagination.total + systemItems.length : null

  useEffect(() => {
    if (!pinSystem || wasPinned.current || fetchedSystem.length === 0) return
    startEnter(fetchedSystem)
  }, [pinSystem, fetchedSystem.length])

  const handleFiltersChange = (next: Parameters<typeof setFilters>[0]) => {
    setFilters(next)
    setPage(1)
  }

  return (
    <div className={'ListPage DataContractsPage'}>
      <div className={'InfoBlock'}>
        <div className={'ListPage__Controls'}>
          <PageTitle
            title={'Data contracts'}
            description={introContent}
            className={'ListPage__Title DataContractsPage__Title'}
          />

          <DataContractsStatsInline
            className={'ListPage__Stats DataContractsPage__Stats'}
            total={listTotal}
          />

          <label className={'ListPage__ShowAll DataContractsPage__ShowAll'} htmlFor={'show-system-contracts'}>
            <span>Show system contracts</span>
            <input
              id={'show-system-contracts'}
              type={'checkbox'}
              checked={showSystem}
              onChange={e => {
                const next = e.target.checked
                const items = fetchedSystem.length > 0 ? fetchedSystem : cachedSystem.current
                if (!next) {
                  clearTimer(enterTimeout)
                  setEnteringKeys(new Set())
                  setExitingItems(items)
                  setLeavingKeys(idsOf(items))
                  clearTimer(leaveTimeout)
                  leaveTimeout.current = window.setTimeout(() => {
                    setExitingItems([])
                    setLeavingKeys(new Set())
                    leaveTimeout.current = null
                  }, 320 + Math.max(0, items.length - 1) * 45 + 40)
                  wasPinned.current = false
                } else {
                  clearTimer(leaveTimeout)
                  setExitingItems([])
                  setLeavingKeys(new Set())
                  startEnter(items)
                }
                setShowSystem(next)
                setPage(1)
              }}
            />
          </label>

          <DataContractsFilter
            onFilterChange={handleFiltersChange}
            isMobile={isMobile}
            className={'ListPage__Filters DataContractsPage__Filters'}
          />
        </div>

        {!dataContracts.isError ? (
          <DataContractsList
            dataContracts={listItems}
            loading={dataContracts.isLoading && pageItems.length === 0}
            itemsCount={pageSize}
            enteringKeys={enteringKeys}
            leavingKeys={leavingKeys}
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
