'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import BlocksList from '../../components/blocks/BlocksList'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import NetworkStatsInline from '../../components/stats/NetworkStatsInline'
import PageTitle from '../../components/intro/PageTitle'
import type { Block, LoadableState, PaginatedResultSet } from '../../types'
import introContent from './introContent'
import './Blocks.css'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

type QueryFilters = Record<string, string | number | boolean | string[] | null | undefined>

function toNumber(value: unknown): number | null {
  if (value === '' || value == null) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function addRange(
  out: QueryFilters,
  value: unknown,
  minKey: string,
  maxKey: string,
  minAllowed: number,
  maxAllowed: number
) {
  const range = value as { min?: unknown; max?: unknown } | undefined
  const min = toNumber(range?.min)
  const max = toNumber(range?.max)
  if (min != null && min >= minAllowed) out[minKey] = min
  if (max != null && max >= maxAllowed) out[maxKey] = max
  const sentMin = out[minKey] as number | undefined
  const sentMax = out[maxKey] as number | undefined
  if (sentMin != null && sentMax != null && sentMax < sentMin) {
    delete out[minKey]
    delete out[maxKey]
  }
}

function toBlocksApiFilters(state: Record<string, unknown>): QueryFilters {
  const out: QueryFilters = {}
  addRange(out, state.height, 'height_min', 'height_max', 1, 2)
  addRange(out, state.epoch_index, 'epoch_index_min', 'epoch_index_max', 0, 1)
  addRange(out, state.tx_count, 'tx_count_min', 'tx_count_max', 0, 0)
  addRange(out, state.gas, 'gas_min', 'gas_max', 0, 0)
  if (typeof state.validator === 'string') {
    const validator = state.validator.trim()
    if (/^[A-Za-z0-9]{64}$/.test(validator)) out.validator = validator
  }
  if (typeof state.hash === 'string') {
    const hash = state.hash.trim()
    if (/^[A-Za-z0-9]{64}$/.test(hash)) out.hash = hash
  }
  const ts = state.timestamp as { start?: Date | null; end?: Date | null } | null
  const start = ts?.start ? new Date(ts.start) : null
  const end = ts?.end ? new Date(ts.end) : null
  if (start && !Number.isNaN(start.getTime())) out.timestamp_start = start.toISOString()
  if (end && !Number.isNaN(end.getTime())) out.timestamp_end = end.toISOString()
  if (
    out.timestamp_start &&
    out.timestamp_end &&
    new Date(String(out.timestamp_start)).getTime() >
      new Date(String(out.timestamp_end)).getTime()
  ) {
    delete out.timestamp_start
    delete out.timestamp_end
  }
  return out
}

interface BlocksProps {
  defaultPage?: number
  defaultPageSize?: number
}

function Blocks({ defaultPage = 1, defaultPageSize }: BlocksProps) {
  const [blocks, setBlocks] = useState<LoadableState<PaginatedResultSet<Block>>>({
    data: {} as PaginatedResultSet<Block>,
    loading: true,
    error: false
  })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const pageCount = Math.ceil(total / pageSize) ? Math.ceil(total / pageSize) : 1
  const [filters, setFilters] = useState<QueryFilters>({})
  const [columnFilters, setColumnFilters] = useState<Record<string, unknown>>({})
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setBlocks(prev => ({ ...prev, loading: true, error: false }))

    const fetchData = async () => {
      const hash = typeof filters.hash === 'string' ? filters.hash : ''
      const request = hash
        ? Api.getBlockByHash(hash).then(block => ({
            resultSet: [block],
            pagination: { page: 1, limit: pageSize, total: 1 }
          }))
        : Api.getBlocks(Math.max(1, currentPage + 1), Math.max(1, pageSize), 'desc', filters)

      request
        .then(res => {
          setTotal(res.pagination.total)
          fetchHandlerSuccess(setBlocks, res)
        })
        .catch(err => {
          setTotal(0)
          fetchHandlerError(setBlocks, err)
        })
    }

    fetchData()
  }, [currentPage, pageSize, filters])

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '', 10) || paginateConfig.defaultPage
    setCurrentPage(Math.max(page - 1, 0))
    setPageSize(
      parseInt(searchParams.get('page-size') || '', 10) || paginateConfig.pageSize.default
    )
  }, [searchParams, pathname])

  useEffect(() => {
    const urlParameters = new URLSearchParams(Array.from(searchParams.entries()))

    if (
      currentPage + 1 === paginateConfig.defaultPage &&
      pageSize === paginateConfig.pageSize.default
    ) {
      urlParameters.delete('page')
      urlParameters.delete('page-size')
    } else {
      urlParameters.set('page', String(currentPage + 1))
      urlParameters.set('page-size', String(pageSize))
    }

    router.push(`${pathname}?${urlParameters.toString()}`, { scroll: false })
  }, [currentPage, pageSize])

  const onColumnFilterChange = (key: string, value: unknown) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      const next = toBlocksApiFilters(columnFilters)
      setFilters(prev => {
        if (JSON.stringify(prev) === JSON.stringify(next)) return prev
        setCurrentPage(0)
        return next
      })
    }, 400)
    return () => window.clearTimeout(id)
  }, [columnFilters])

  return (
    <div className={'ListPage Blocks'}>
      <div className={'InfoBlock'}>
        <div className={'Blocks__Controls'}>
          <PageTitle title={'Blocks'} description={introContent} className={'Blocks__Title'} />

          <NetworkStatsInline className={'Blocks__Stats'} />
        </div>

        {blocks.error ? (
          <div className={'ListPage__Error'}>
            <ErrorMessageBlock />
          </div>
        ) : null}
        <BlocksList
          blocks={blocks.data?.resultSet}
          loading={blocks.loading && !blocks.data?.resultSet?.length}
          filterValues={columnFilters}
          onFilterChange={onColumnFilterChange}
        />

        {(blocks.data?.resultSet?.length ?? 0) > 0 && (
          <div className={'ListNavigation'}>
            <div className={'ListNavigation__Balance'} />
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
        )}
      </div>
    </div>
  )
}

export default Blocks
