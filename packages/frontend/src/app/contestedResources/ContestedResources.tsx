'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { LoadingList } from '../../components/loading'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  ContestedResourcesList,
  ContestedResourcesFilter,
  useContestedResourcesFilters
} from '../../components/contestedResources'
import ContestedResourcesStatsInline from '../../components/contestedResources/ContestedResourcesStatsInline'
import PageTitle from '../../components/intro/PageTitle'
import type { ContestedResource, LoadableState, PaginatedResultSet } from '../../types'
import introContent from './introContent'
import './ContestedResourcesPage.css'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

interface ContestedResourcesProps {
  defaultPage?: number
  defaultPageSize?: number
}

function ContestedResources({ defaultPage = 1, defaultPageSize }: ContestedResourcesProps) {
  const [contestedResources, setContestedResources] = useState<
    LoadableState<PaginatedResultSet<ContestedResource>>
  >({
    data: {} as PaginatedResultSet<ContestedResource>,
    loading: true,
    error: false
  })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const { filters, setFilters } = useContestedResourcesFilters()
  const pageCount = Math.ceil(total / pageSize) ? Math.ceil(total / pageSize) : 1
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const fetchData = (page: number, count: number, currentFilters: Record<string, unknown>) => {
    setContestedResources(state => ({ ...state, loading: true }))

    Api.getContestedResources(page, count, 'desc', undefined, currentFilters as never)
      .then(res => {
        if (res.pagination.total === -1) {
          setCurrentPage(0)
        }
        fetchHandlerSuccess(setContestedResources, res)
        setTotal(res.pagination.total)
      })
      .catch(err => fetchHandlerError(setContestedResources, err))
  }

  useEffect(
    () => fetchData(currentPage + 1, pageSize, filters as Record<string, unknown>),
    [pageSize, currentPage, JSON.stringify(filters)]
  )

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
    <div className={'ListPage ContestedResources ContestedResourcesPage'}>
      <div className={'InfoBlock'}>
      <div className={'ContestedResourcesPage__Controls'}>
        <PageTitle
          title={'Contested Resources'}
          description={introContent}
          className={'ContestedResourcesPage__Title'}
        />

        <ContestedResourcesStatsInline className={'ContestedResourcesPage__Stats'} />

        <ContestedResourcesFilter
          initialFilters={filters as never}
          className={'ContestedResourcesPage__Filters'}
          onFilterChange={next => {
            setFilters(next as never)
            setCurrentPage(0)
          }}
        />
      </div>

      {!contestedResources.error ? (
        <>
          {!contestedResources.loading ? (
            <ContestedResourcesList contestedResources={contestedResources.data?.resultSet} />
          ) : (
            <LoadingList itemsCount={pageSize} />
          )}
        </>
      ) : (
        <div className={'ListPage__Error'}>
          <ErrorMessageBlock />
        </div>
      )}

      {(contestedResources.data?.resultSet?.length ?? 0) > 0 && (
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

export default ContestedResources
