'use client'

import { useEffect, useState, useCallback } from 'react'
import * as Api from '../../util/Api'
import IdentitiesList from '../../components/identities/IdentitiesList'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { LoadingList } from '../../components/loading'
import { ErrorMessageBlock } from '../../components/Errors'

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

function Identities () {
  const [identities, setIdentities] = useState({ data: {}, loading: true, error: false })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(0)
  const pageCount = Math.ceil(total / pageSize)

  const fetchData = (page, count) => {
    setIdentities(state => ({ ...state, loading: true }))

    Api.getIdentities(page, count, 'desc')
      .then(identities => {
        setIdentities({ data: identities, loading: false, error: false })
        setTotal(identities.pagination.total)
      })
      .catch(err => {
        console.error(err)
        setIdentities({ data: null, loading: false, error: true })
      })
  }

  useEffect(() => fetchData(paginateConfig.defaultPage, pageSize), [pageSize])

  const handlePageClick = useCallback(({ selected }) => {
    setCurrentPage(selected)
    fetchData(selected + 1, pageSize)
  }, [pageSize])

  useEffect(() => {
    setCurrentPage(0)
    handlePageClick({ selected: 0 })
  }, [pageSize, handlePageClick])

  return (
        <Container
            maxW='container.md'
            mt={8}
            className={'IdentitiesPage'}
        >
            <Container
                maxW='container.md'
                borderWidth='1px' borderRadius='lg'
                className={'InfoBlock'}
            >
                <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Identities</Heading>

                {!identities.error
                  ? !identities.loading
                      ? <IdentitiesList identities={identities.data.resultSet}/>
                      : <LoadingList itemsCount={pageSize}/>
                  : <ErrorMessageBlock/>
                }

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
        </Container>
  )
}

export default Identities
