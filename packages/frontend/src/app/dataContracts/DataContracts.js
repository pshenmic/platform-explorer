'use client'

import { useEffect, useState, useCallback } from 'react'
import * as Api from '../../util/Api'
import DataContractsList from '../../components/dataContracts/DataContractsList'
import Pagination from '../../components/pagination'
import { ListLoadingPreview } from '../../components/lists'
import { ErrorMessageBlock } from '../../components/Errors'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'

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

function DataContractsLayout () {
  const [dataContracts, setDataContracts] = useState({ data: {}, loading: true, error: false })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(0)
  const pageCount = Math.ceil(total / pageSize)

  const fetchData = (page, count) => {
    setDataContracts(state => ({ ...state, loading: true }))

    Api.getDataContracts(page, count, 'desc')
      .then(res => {
        setDataContracts({ data: res, loading: false, error: false })
        setTotal(res.pagination.total)
      })
      .catch(err => {
        console.error(err)
        setDataContracts({ data: null, loading: false, error: true })
      })
  }

  useEffect(() => fetchData(paginateConfig.defaultPage, pageSize), [pageSize])

  const handlePageClick = useCallback(({ selected }) => {
    fetchData(selected + 1, pageSize)
    setCurrentPage(selected)
  }, [pageSize])

  return (
    <div className={'container'}>
      {dataContracts &&
          <Container
              maxW='container.md'
              padding={3}
              mt={8}
              mb={4}
              borderWidth='1px' borderRadius='lg'
              className={'InfoBlock'}
          >
              <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Data contracts</Heading>

              {!dataContracts.loading
                ? !dataContracts.error
                    ? <DataContractsList dataContracts={dataContracts.data.resultSet} size='l'/>
                    : <Container h={20}><ErrorMessageBlock/></Container>
                : <ListLoadingPreview itemsCount={pageSize}/>}

              <div className={'ListNavigation'}>
                  <Box display={['none', 'none', 'block']} width={'100px'}/>
                  <Pagination
                      onPageChange={handlePageClick}
                      pageCount={pageCount}
                      forcePage={currentPage}
                  />
                  <PageSizeSelector
                      PageSizeSelectHandler={(e) => setPageSize(Number(e.target.value))}
                      defaultValue={paginateConfig.pageSize.default}
                      items={paginateConfig.pageSize.values}
                  />
              </div>
          </Container>
      }
    </div>
  )
}

export default DataContractsLayout
