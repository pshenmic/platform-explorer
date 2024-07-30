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
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function Validators ({ defaultPage = 1, defaultPageSize, defaultIsActive }) {
  const [validators, setValidators] = useState({ data: {}, loading: true, error: false })
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const [total, setTotal] = useState(1)
  const [isActive, setIsActive] = useState(defaultIsActive !== undefined ? defaultIsActive === true : true)
  const pageCount = Math.ceil(total / pageSize)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const fetchData = (page, count, active) => {
    setValidators({ data: {}, loading: true, error: false })

    Api.getValidators(page, count, 'desc', active)
      .then(res => {
        if (res.pagination.total === -1) {
          setCurrentPage(0)
        }
        fetchHandlerSuccess(setValidators, res)
        setTotal(res.pagination.total)
      })
      .catch(err => fetchHandlerError(setValidators, err))
  }

  useEffect(() => fetchData(currentPage + 1, pageSize, isActive), [pageSize, currentPage])

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

  const isActiveSwitchHandler = (activeState) => {
    setCurrentPage(0)
    setIsActive(activeState)
    fetchData(1, pageSize, activeState)
  }

  return (
    <Container
        maxW={'container.xl'}
        mt={8}
        className={'Transactions'}
    >
        <Container
            maxW={'container.xl'}
            borderWidth={'1px'} borderRadius={'lg'}
            className={'InfoBlock'}
        >
            <Heading className={'InfoBlock__Title'} as={'h1'} size={'sm'}>Validators</Heading>
            <Box mb={2}>
              <Switcher
                options={[
                  {
                    title: 'Active'
                  },
                  {
                    title: 'Inactive'
                  }
                ]}
                onChange={e => isActiveSwitchHandler(e === 'Active')}
              />
            </Box>

            {!validators.error
              ? <ValidatorsList validators={validators} pageSize={pageSize}/>
              : <Container h={20}><ErrorMessageBlock/></Container>}

            {validators.data?.resultSet?.length > 0 &&
              <div className={'ListNavigation'}>
                <Box display={['none', 'none', 'block']} width={'100px'}/>
                <Pagination
                    onPageChange={({ selected }) => setCurrentPage(selected)}
                    pageCount={pageCount}
                    forcePage={currentPage}
                />
                <PageSizeSelector
                    PageSizeSelectHandler={(e) => setPageSize(Number(e.target.value))}
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
