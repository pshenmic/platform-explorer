'use client'

import { useState, useEffect, useCallback } from 'react'
import * as Api from '../../util/Api'
import Pagination from '../../components/pagination'
import GoToHeightForm from '../../components/goToHeightForm/GoToHeightForm'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import BlocksList from '../../components/blocks/BlocksList'
import { LoadingList } from '../../components/loading'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import './Blocks.scss'

import {
  Container,
  Heading
} from '@chakra-ui/react'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function Blocks () {
  const [blocks, setBlocks] = useState({ data: {}, loading: true, error: false })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(0)
  const [blockHeightToSearch, setBlockHeightToSearch] = useState(0)
  const pageCount = Math.ceil(total / pageSize) ? Math.ceil(total / pageSize) : 1

  const fetchData = (page, count) => {
    setBlocks(state => ({ ...state, loading: true }))

    Api.getBlocks(page, count, 'desc')
      .then(res => {
        fetchHandlerSuccess(setBlocks, res)
        setTotal(res.pagination.total)
      })
      .catch(err => fetchHandlerError(setBlocks, err))
  }

  useEffect(() => fetchData(paginateConfig.defaultPage, paginateConfig.pageSize.default), [])

  const handlePageClick = useCallback(({ selected }) => {
    setCurrentPage(selected)
    fetchData(selected + 1, pageSize)
  }, [pageSize])

  const goToHeight = (e) => {
    e.preventDefault()

    const page = Math.ceil((total - blockHeightToSearch + 2) / pageSize) - 1
    setCurrentPage(page)
    handlePageClick({ selected: page })
  }

  useEffect(() => {
    setCurrentPage(0)
    handlePageClick({ selected: 0 })
  }, [pageSize, handlePageClick])

  return (
      <Container
          maxW='container.lg'
          color='white'
          mt={8}
          mb={8}
          className={'Blocks'}
      >
          <Container
              maxW='container.lg'
              _dark={{ color: 'white' }}
              borderWidth='1px' borderRadius='lg'
              className={'InfoBlock'}
          >
              <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Blocks</Heading>

              {!blocks.error
                ? <>
                    {!blocks.loading
                      ? <BlocksList blocks={blocks.data.resultSet}/>
                      : <LoadingList itemsCount={pageSize}/>
                    }
                  </>
                : <Container h={20}><ErrorMessageBlock/></Container>}

              <div className={'ListNavigation'}>
                  <GoToHeightForm
                      goToHeightHandler={goToHeight}
                      goToHeightChangeHandle={(e) => setBlockHeightToSearch(e.target.value)}
                      isValid={() => {
                        return (
                          blockHeightToSearch.length > 0 &&
                          Number(blockHeightToSearch) <= total &&
                          Number(blockHeightToSearch) > 0
                        )
                      }}
                      disabled={blocks.error}
                  />
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

export default Blocks
