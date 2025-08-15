'use client'

import * as Api from '../../util/Api'
import { fetchHandlerError, fetchHandlerSuccess } from '../../util'
import { useEffect, useState } from 'react'
import TokensList from '../../components/tokens/TokensList'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { LoadingList } from '../../components/loading'
import { ErrorMessageBlock } from '../../components/Errors'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Container, Heading, Box } from '@chakra-ui/react'
import './Tokens.scss'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function Tokens ({ defaultPage = 1, defaultPageSize }) {
  const [tokens, setTokens] = useState({ data: {}, loading: false, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const [total, setTotal] = useState(0)
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const pageCount = Math.ceil(total / pageSize)
  const [filters] = useState({})
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const fetchData = (page, count, filters) => {
    setTokens({ data: {}, loading: true, error: false })

    Api.getTokens(page, count, 'desc', filters)
      .then(res => {
        if (res.pagination.total === -1) {
          setCurrentPage(0)
        }
        fetchHandlerSuccess(setTokens, res)
        setTotal(res.pagination.total)
      })
      .catch(err => fetchHandlerError(setTokens, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }

  useEffect(() => fetchData(currentPage + 1, pageSize, filters), [pageSize, currentPage, filters])

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
        mt={8}
        className={'TokensPage'}
    >
      <Container
        maxW={'container.maxPageW'}
        className={'InfoBlock'}
      >
        <Heading className={'InfoBlock__Title'} as={'h1'}>Tokens</Heading>

        {!tokens.error
          ? !tokens.loading
              ? <TokensList tokens={tokens?.data?.resultSet || []} rate={rate}/>
              : <LoadingList itemsCount={pageSize}/>
          : <ErrorMessageBlock h={20}/>
        }

        {tokens.data?.resultSet?.length > 0 &&
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

export default Tokens
