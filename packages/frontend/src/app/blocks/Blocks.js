'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
import Pagination from '../../components/pagination'
import GoToHeightForm from '../../components/goToHeightForm/GoToHeightForm'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import BlocksList from '../../components/blocks/BlocksList'
import { LoadingList } from '../../components/loading'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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

function Blocks ({ defaultPage = 1, defaultPageSize }) {
  const [blocks, setBlocks] = useState({ data: {}, loading: true, error: false })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const [blockHeightToSearch, setBlockHeightToSearch] = useState(0)
  const pageCount = Math.ceil(total / pageSize) ? Math.ceil(total / pageSize) : 1
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const fetchData = (page, count) => {
    setBlocks(state => ({ ...state, loading: true }))

    Api.getBlocks(page, count, 'desc')
      .then(res => {
        if (res.pagination.total === -1) {
          setCurrentPage(0)
        }
        fetchHandlerSuccess(setBlocks, res)
        setTotal(res.pagination.total)
      })
      .catch(err => fetchHandlerError(setBlocks, err))
  }

  useEffect(() => fetchData(currentPage + 1, pageSize), [pageSize, currentPage])

  useEffect(() => {
    const urlParameters = new URLSearchParams(Array.from(searchParams.entries()))

    if (currentPage + 1 === paginateConfig.defaultPage && pageSize === paginateConfig.pageSize.default) {
      urlParameters.delete('p', currentPage + 1)
      urlParameters.delete('ps', pageSize)
    } else {
      urlParameters.set('p', currentPage + 1)
      urlParameters.set('ps', pageSize)
    }

    router.push(`${pathname}?${urlParameters.toString()}`, { scroll: false })
  }, [currentPage, pageSize])

  const goToHeight = e => {
    e.preventDefault()
    const page = Math.ceil((total - blockHeightToSearch + 1) / pageSize) - 1
    setCurrentPage(page)
  }

  return (
      <Container
          maxW={'container.xl'}
          color={'white'}
          mt={8}
          mb={8}
          className={'Blocks'}
      >
          <Container
              maxW={'container.xl'}
              _dark={{ color: 'white' }}
              borderWidth={'1px'} borderRadius={'lg'}
              className={'InfoBlock'}
          >
              <Heading className={'InfoBlock__Title'} as={'h1'} size={'sm'}>Blocks</Heading>

              {!blocks.error
                ? <>
                    {!blocks.loading
                      ? <BlocksList blocks={blocks.data.resultSet}/>
                      : <LoadingList itemsCount={pageSize}/>
                    }
                  </>
                : <Container h={20}><ErrorMessageBlock/></Container>}

              {blocks.data?.resultSet?.length > 0 &&
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
                        onPageChange={({ selected }) => setCurrentPage(selected)}
                        pageCount={pageCount}
                        forcePage={currentPage}
                    />
                    <PageSizeSelector
                        PageSizeSelectHandler={(e) => setPageSize(Number(e.target.value))}
                        defaultValue={pageSize}
                        items={paginateConfig.pageSize.values}
                    />
                </div>
              }
          </Container>
      </Container>
  )
}

export default Blocks
