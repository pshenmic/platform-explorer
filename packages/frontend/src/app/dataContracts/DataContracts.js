'use client'

import * as Api from '../../util/Api'
import DataContractsList from '../../components/dataContracts/DataContractsList'
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
import { useDataContractsFilters, useDataContractsSorting } from '@components/dataContracts/hooks'
import { DataContractsFilter } from '@components/dataContracts/DataContractsFilter'

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

  const dataContracts = useQuery({
    queryKey: ['dataContracts', page, pageSize, ...Object.values(filters)],
    queryFn: () => Api.getDataContracts(
      page,
      pageSize,
      sorting.order,
      sorting.orderBy,
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

  const pagination = dataContracts.data?.pagination

  const handleFiltersChange = (next) => {
    setFilters(next)
    setPage(1)
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
            <Heading className={'InfoBlock__Title'} as={'h1'}>Data contracts</Heading>
            <DataContractsFilter
              onFilterChange={handleFiltersChange}
              isMobile={isMobile}
              className={'DataContractsIntro__Filters'}
            />
            {!dataContracts.isError
              ? <DataContractsList
                  dataContracts={dataContracts.data?.resultSet}
                  loading={dataContracts.isLoading}
                  itemsCount={pageSize}
                />
              : <Container h={20}><ErrorMessageBlock/></Container>
            }

            {dataContracts.data?.resultSet?.length > 0 &&
              <div className={'ListNavigation'}>
                <Box display={['none', 'none', 'block']} width={'155px'}/>
                <Pagination
                  onPageChange={({ selected }) => setPage((selected || 0) + 1)}
                  pageCount={pagination.pageCount}
                  forcePage={pagination.forcePage}
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

export default DataContractsLayout
