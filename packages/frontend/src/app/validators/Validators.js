'use client'

import { useEffect, useState } from 'react'
import * as Api from '../../util/Api'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { ErrorMessageBlock } from '../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../util'
import { ValidatorsList } from '../../components/validators'
import { Switcher } from '../../components/ui'
import { Container, Box, Heading } from '@chakra-ui/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100, 'All']
  },
  defaultPage: 1
}

function Validators ({ defaultPage = 1, defaultPageSize, defaultIsActive }) {
  const [validators, setValidators] = useState({ data: {}, loading: true, error: false })
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const [total, setTotal] = useState(1)
  const [activeState, setActiveState] = useState(defaultIsActive !== undefined ? defaultIsActive : 'all')
  const pageCount = String(pageSize).toLocaleLowerCase() !== 'all'
    ? Math.ceil(total / pageSize)
    : 1
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const fetchData = (page, count, active) => {
    setValidators({ data: {}, loading: true, error: false })

    if (String(count).toLowerCase() === 'all') count = 0

    const state = (() => {
      if (active === 'all') return null
      return active === 'current'
    })()

    Api.getValidators(page, count, 'desc', state)
      .then(res => {
        if (res.pagination.total === -1) {
          setCurrentPage(0)
        }
        fetchHandlerSuccess(setValidators, res)
        setTotal(res.pagination.total)
      })
      .catch(err => fetchHandlerError(setValidators, err))
  }

  useEffect(() => fetchData(currentPage + 1, pageSize, activeState), [pageSize, currentPage])

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || paginateConfig.defaultPage
    setCurrentPage(Math.max(page - 1, 0))
    setPageSize(searchParams.get('page-size') || paginateConfig.pageSize.default)
  }, [searchParams, pathname])

  useEffect(() => {
    const urlParameters = new URLSearchParams(Array.from(searchParams.entries()))

    if (activeState.toLowerCase() !== 'all') {
      urlParameters.set('active-state', activeState.toLowerCase())
    } else {
      urlParameters.delete('active-state')
    }

    if (currentPage + 1 === paginateConfig.defaultPage && pageSize === paginateConfig.pageSize.default) {
      urlParameters.delete('page')
      urlParameters.delete('page-size')
    } else {
      urlParameters.set('page', currentPage + 1)
      urlParameters.set('page-size', pageSize)
    }

    router.push(`${pathname}?${urlParameters.toString()}`, { scroll: false })
  }, [currentPage, pageSize, activeState])

  useEffect(() => {
    setCurrentPage(0)
    fetchData(1, pageSize, activeState)
  }, [activeState])

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
            onChange={activeOption => setActiveState(activeOption.toLowerCase())}
          />
        </Box>

        {!validators.error
          ? <ValidatorsList validators={validators} pageSize={pageSize}/>
          : <Container h={20}><ErrorMessageBlock/></Container>}

        {validators.data?.resultSet?.length > 0 &&
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

export default Validators
