'use client'

import { useEffect, useState } from 'react'
import * as Api from '../../util/Api'
import DataContractsList from '../../components/dataContracts/DataContractsList'
import Pagination from '../../components/pagination'
import { ErrorMessageBlock } from '../../components/Errors'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'

import {
  Container,
  Heading,
  Box
} from '@chakra-ui/react'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function DataContractsLayout ({ defaultPage = 1, defaultPageSize }) {
  const [dataContracts, setDataContracts] = useState({ data: {}, loading: true, error: false })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const pageCount = Math.ceil(total / pageSize)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const fetchData = (page, count) => {
    setDataContracts(state => ({ ...state, loading: true }))

    Api.getDataContracts(page, count, 'desc')
      .then(res => {
        if (res.pagination.total === -1) {
          setCurrentPage(0)
        }
        fetchHandlerSuccess(setDataContracts, res)
        setTotal(res.pagination.total)
      })
      .catch(err => fetchHandlerError(setDataContracts, err))
  }

  useEffect(() => fetchData(currentPage + 1, pageSize), [pageSize, currentPage])

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || paginateConfig.defaultPage
    setCurrentPage(Math.max(page - 1, 0))
    setPageSize(parseInt(searchParams.get('page-size')) || paginateConfig.pageSize.default)
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

    router.push(`${pathname}?${urlParameters.toString()}`, { scroll: false })
  }, [currentPage, pageSize])

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

            {!dataContracts.error
              ? <DataContractsList
                  dataContracts={dataContracts.data?.resultSet}
                  loading={dataContracts.loading}
                  itemsCount={pageSize}
                />
              : <Container h={20}><ErrorMessageBlock/></Container>
            }

            {dataContracts.data?.resultSet?.length > 0 &&
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

export default DataContractsLayout
