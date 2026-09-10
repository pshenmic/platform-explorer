'use client'

import * as Api from '../../util/Api'
import { useState, useEffect } from 'react'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import BlocksList from '../../components/blocks/BlocksList'
import { LoadingList } from '../../components/loading'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useIsMobile } from '../../hooks'
import { BlocksFilter } from '../../components/blocks'
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
  type QueryFilters = Record<string, string | number | boolean | string[] | null | undefined>
  const [filters, setFilters] = useState<QueryFilters>({})
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()

  const filtersChangeHandler = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters as QueryFilters)
    setCurrentPage(0)
  }

  useEffect(() => {
    setBlocks(prev => ({ ...prev, loading: true, error: false }))

    const fetchData = async () => {
      Api.getBlocks(Math.max(1, currentPage + 1), Math.max(1, pageSize), 'desc', filters)
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

  return (
    <div className={'ListPage Blocks'}>
      <div className={'InfoBlock'}>
        <div className={'Blocks__Controls'}>
          <PageTitle title={'Blocks'} description={introContent} className={'Blocks__Title'} />

          <NetworkStatsInline className={'Blocks__Stats'} />

          <BlocksFilter
            onFilterChange={filtersChangeHandler}
            isMobile={isMobile}
            className={'Blocks__Filters'}
          />
        </div>

        {!blocks.error ? (
          <>
            {!blocks.loading ? (
              <BlocksList blocks={blocks.data?.resultSet} />
            ) : (
              <LoadingList itemsCount={pageSize} />
            )}
          </>
        ) : (
          <div className={'ListPage__Error'}>
            <ErrorMessageBlock />
          </div>
        )}

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
