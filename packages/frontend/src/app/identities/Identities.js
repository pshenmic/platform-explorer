'use client'

import { useEffect, useState } from 'react'
import * as Api from '../../util/Api'
import IdentitiesList from '../../components/identities/IdentitiesList'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { LoadingList } from '../../components/loading'
import { ErrorMessageBlock } from '../../components/Errors'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'

import {
  Container,
  Heading,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Switch
} from '@chakra-ui/react'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function Identities ({ defaultPage = 1, defaultPageSize, defaultShowAll = false }) {
  const [identities, setIdentities] = useState({ data: {}, loading: true, error: false })
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const [showAll, setShowAll] = useState(defaultShowAll)
  const pageCount = Math.ceil(total / pageSize)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const fetchData = (page, count, includeMasternodes) => {
    setIdentities(state => ({ ...state, loading: true }))

    Api.getIdentities(page, count, 'desc', undefined, { includeMasternodes })
      .then(res => {
        if (res.pagination.total === -1) {
          setCurrentPage(0)
        }
        fetchHandlerSuccess(setIdentities, res)
        setTotal(res.pagination.total)
      })
      .catch(err => fetchHandlerError(setIdentities, err))
  }

  useEffect(() => fetchData(currentPage + 1, pageSize, showAll), [pageSize, currentPage, showAll])

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || paginateConfig.defaultPage
    setCurrentPage(Math.max(page - 1, 0))
    setPageSize(parseInt(searchParams.get('page-size')) || paginateConfig.pageSize.default)
    setShowAll(searchParams.get('show-all') === 'true')
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

    if (showAll) {
      urlParameters.set('show-all', 'true')
    } else {
      urlParameters.delete('show-all')
    }

    router.push(`${pathname}?${urlParameters.toString()}`, { scroll: false })
  }, [currentPage, pageSize, showAll])

  const handleShowAllChange = (e) => {
    setShowAll(e.target.checked)
    setCurrentPage(0)
  }

  return (
    <Container
        maxW={'container.maxPageW'}
        mt={8}
        className={'IdentitiesPage'}
    >
      <Container
        maxW={'container.maxPageW'}
        className={'InfoBlock'}
      >
        <Flex align={'center'} justify={'space-between'} wrap={'wrap'} gap={2} mb={4}>
          <Heading className={'InfoBlock__Title'} as={'h1'} mb={0}>
            Identities {total > 0 && <span style={{ opacity: 0.6, fontSize: '0.7em', fontWeight: 'normal' }}>({total})</span>}
          </Heading>
          <FormControl display={'flex'} alignItems={'center'} width={'auto'}>
            <FormLabel htmlFor={'show-all-identities'} mb={0} mr={2} fontSize={'sm'} fontWeight={'normal'}>
              Show all (incl. masternode)
            </FormLabel>
            <Switch
              id={'show-all-identities'}
              isChecked={showAll}
              onChange={handleShowAllChange}
            />
          </FormControl>
        </Flex>

        {!identities.error
          ? !identities.loading
              ? <IdentitiesList identities={identities.data.resultSet}/>
              : <LoadingList itemsCount={pageSize}/>
          : <ErrorMessageBlock h={20}/>
        }

        {identities.data?.resultSet?.length > 0 &&
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

export default Identities
