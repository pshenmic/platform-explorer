'use client'

import * as Api from '../../util/Api'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { normalizePagination } from '../../util'
import { Switcher } from '@components/ui'
import { Container, Box, Heading, useBreakpointValue } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { parseAsInteger, parseAsStringEnum, useQueryState } from 'nuqs'
import { useValidatorsFilters, ValidatorsFilter, ValidatorsList } from '@components/validators'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100, 'All']
  },
  defaultPage: 1
}

function Validators () {
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { filters, setFilters } = useValidatorsFilters()
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
  const [activeState, setActiveState] = useQueryState(
    'tab',
    parseAsStringEnum(['all', 'current', 'queued'])
      .withDefault('all')
      .withOptions({ scroll: false, shallow: true })
  )

  const validators = useQuery({
    queryKey: ['validators', page, pageSize, activeState, ...Object.values(filters)],
    queryFn: () => Api.getValidators(
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

  const pagination = validators.data?.pagination

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
        <Heading className={'InfoBlock__Title'} as={'h1'}>Validators</Heading>
        <Box mb={5}>
          <Switcher
            options={[
              { title: 'All' },
              { title: 'Current' },
              { title: 'Queued' }
            ]}
            defaultValue={activeState}
            onChange={(opt) => {
              const next = (opt || '').toLowerCase()
              setActiveState(next)
              setPage(1)
            }}
          />
        </Box>
        <ValidatorsFilter
          onFilterChange={handleFiltersChange}
          isMobile={isMobile}
          className={'ValidatorsIntro__Filters'}
        />
        <ValidatorsList
          list={validators.data?.resultSet}
          loading={validators.isLoading}
          error={validators.isError}
          pageSize={pageSize}
        />
        {validators.data?.resultSet?.length > 0 &&
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

export default Validators
