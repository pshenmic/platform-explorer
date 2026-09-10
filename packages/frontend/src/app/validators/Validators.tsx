'use client'

import * as Api from '../../util/Api'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { normalizePagination } from '../../util'
import { Container, Box, useBreakpointValue } from '@chakra-ui/react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { parseAsInteger, useQueryState } from 'nuqs'
import {
  useValidatorsFilters,
  ValidatorsFilter,
  ValidatorsList,
  ValidatorsStatsInline
} from '@components/validators'
import PageTitle from '../../components/intro/PageTitle'
import introContent from './introContent'
import './ValidatorsPage.css'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100, 'All'] as Array<number | string>
  },
  defaultPage: 1
}

function Validators() {
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

  const validators = useQuery({
    queryKey: ['validators', page, pageSize, ...Object.values(filters)],
    queryFn: () => Api.getValidators(page, pageSize, 'asc', filters),
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

  const pagination = validators.data?.pagination
  const totalValidators = validators.data?.total

  const handleFiltersChange = (next: Record<string, unknown>) => {
    setFilters(next)
    setPage(1)
  }

  return (
    <Container maxW={'container.maxPageW'} mt={8} className={'Validators'}>
      <Container maxW={'container.maxPageW'} className={'InfoBlock'}>
        <div className={'Validators__Controls'}>
          <PageTitle
            title={'Validators'}
            description={introContent}
            className={'Validators__Title'}
          />

          <ValidatorsStatsInline className={'Validators__Stats'} total={totalValidators} />

          <ValidatorsFilter
            onFilterChange={handleFiltersChange}
            isMobile={isMobile}
            className={'Validators__Filters'}
          />
        </div>

        <ValidatorsList
          list={validators.data?.resultSet}
          loading={validators.isLoading}
          error={validators.isError}
          pageSize={pageSize}
        />
        {(validators.data?.resultSet?.length ?? 0) > 0 && (
          <div className={'ListNavigation'}>
            <Box display={['none', 'none', 'block']} width={'155px'} />
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
                setPage(1)
              }}
              value={pageSize}
              items={paginateConfig.pageSize.values}
            />
          </div>
        )}
      </Container>
    </Container>
  )
}

export default Validators
