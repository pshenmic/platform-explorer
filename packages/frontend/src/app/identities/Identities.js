'use client'

import { useEffect, useState } from 'react'
import * as Api from '../../util/Api'
import IdentitiesList from '../../components/identities/IdentitiesList'
import { IdentitiesFilter, useIdentitiesFilters } from '../../components/identities'
import IdentitiesGrowthChartCompact from '../../components/charts/IdentitiesGrowthChartCompact'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { LoadingList } from '../../components/loading'
import { ErrorMessageBlock } from '../../components/Errors'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
import PageTitle from '../../components/intro/PageTitle'
import NetworkStatsInline from '../../components/stats/NetworkStatsInline'
import introContent from './intro.md'

import {
  Container,
  Box,
  FormControl,
  FormLabel,
  Switch
} from '@chakra-ui/react'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function Identities ({ defaultPage = 1, defaultPageSize, defaultShowAll = false }) {
  const [identities, setIdentities] = useState({ data: {}, loading: true, error: false })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const [showAll, setShowAll] = useState(defaultShowAll)
  const { filters, setFilters } = useIdentitiesFilters()
  const pageCount = Math.ceil(total / pageSize)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const fetchData = (page, count, includeMasternodes, currentFilters) => {
    setIdentities(state => ({ ...state, loading: true }))

    const orderBy = currentFilters.order_by || 'balance'
    const order = currentFilters.order || 'desc'

    Api.getIdentities(page, count, order, orderBy, { includeMasternodes, filters: currentFilters })
      .then(res => {
        if (res.pagination.total === -1) {
          setCurrentPage(0)
        }
        fetchHandlerSuccess(setIdentities, res)
        setTotal(res.pagination.total)
      })
      .catch(err => fetchHandlerError(setIdentities, err))
  }

  useEffect(
    () => fetchData(currentPage + 1, pageSize, showAll, filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageSize, currentPage, showAll, JSON.stringify(filters)]
  )

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || paginateConfig.defaultPage
    setCurrentPage(Math.max(page - 1, 0))
    setPageSize(parseInt(searchParams.get('page-size')) || paginateConfig.pageSize.default)
    setShowAll(searchParams.get('show-all') === 'true')
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

    if (showAll) {
      urlParameters.set('show-all', 'true')
    } else {
      urlParameters.delete('show-all')
    }

    router.push(`${pathname}?${urlParameters.toString()}`, { scroll: false })
  }, [currentPage, pageSize, showAll])

  const handleShowAllChange = (e) => {
    setShowAll(e.target.checked)
    setCurrentPage(0)
  }

  return (
    <Container
        maxW={'container.maxPageW'}
        mt={8}
        className={'IdentitiesPage'}
    >
      <Container
        maxW={'container.maxPageW'}
        className={'InfoBlock'}
      >
        <div className={'IdentitiesPage__Controls'}>
          <PageTitle title={'Identities'} description={introContent} className={'IdentitiesPage__Title'}/>

          <NetworkStatsInline
            className={'IdentitiesPage__Stats'}
            items={[{ label: 'Identities', value: currencyRound(total), loading: identities.loading }]}
          />

          <FormControl display={'flex'} alignItems={'center'} width={'auto'} className={'IdentitiesPage__ShowAll'}>
            <FormLabel htmlFor={'show-all-identities'} mb={0} mr={2} fontSize={'sm'} fontWeight={'normal'}>
              Show all (incl. masternode)
            </FormLabel>
            <Switch
              id={'show-all-identities'}
              isChecked={showAll}
              onChange={handleShowAllChange}
            />
          </FormControl>

          <IdentitiesFilter
            initialFilters={filters}
            className={'IdentitiesPage__Filters'}
            onFilterChange={(next) => {
              setFilters(next)
              setCurrentPage(0)
            }}
          />
        </div>

        <IdentitiesGrowthChartCompact className={'IdentitiesPage__GrowthChart'}/>

        {!identities.error
          ? !identities.loading
              ? <IdentitiesList
                  identities={identities.data.resultSet}
                  sort={{ order_by: filters.order_by || 'balance', order: filters.order || 'desc' }}
                  page={currentPage}
                  onSortChange={(next) => {
                    setFilters(next)
                    setCurrentPage(0)
                  }}
                />
              : <LoadingList itemsCount={pageSize}/>
          : <ErrorMessageBlock h={20}/>
        }

        {identities.data?.resultSet?.length > 0 &&
          <div className={'ListNavigation'}>
            <Box display={['none', 'none', 'block']} width={'155px'}/>
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

export default Identities
