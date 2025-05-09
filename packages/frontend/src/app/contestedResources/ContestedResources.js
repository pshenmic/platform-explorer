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
  Box,
  Container,
  Heading
} from '@chakra-ui/react'
import { ContestedResourcesList } from '../../components/contestedResources'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function ContestedResources ({ defaultPage = 1, defaultPageSize }) {
  const [contestedResources, setContestedResources] = useState({ data: {}, loading: true, error: false })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const pageCount = Math.ceil(total / pageSize) ? Math.ceil(total / pageSize) : 1
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const fetchData = (page, count) => {
    setContestedResources(state => ({ ...state, loading: true }))

    Api.getContestedResources(page, count, 'desc')
      .then(res => {
        if (res.pagination.total === -1) {
          setCurrentPage(0)
        }
        fetchHandlerSuccess(setContestedResources, res)
        setTotal(res.pagination.total)
      })
      .catch(err => fetchHandlerError(setContestedResources, err))
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
      className={'InfoBlock ContestedResources'}
      maxW={'container.maxPageW'}
      my={8}
    >
      <Heading className={'InfoBlock__Title'} as={'h1'}>Contested Resources</Heading>

      {!contestedResources.error
        ? <>
          {!contestedResources.loading
            ? <ContestedResourcesList contestedResources={contestedResources.data.resultSet}/>
            : <LoadingList itemsCount={pageSize}/>
          }
        </>
        : <Container h={20}><ErrorMessageBlock/></Container>}

      {contestedResources.data?.resultSet?.length > 0 &&
        <div className={'ListNavigation'}>
          <Box w={'210px'}/>
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
  )
}

export default ContestedResources
