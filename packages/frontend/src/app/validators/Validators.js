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

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

function Validators () {
  const [validators, setValidators] = useState({ data: {}, loading: true, error: false })
  const [pageSize, setPageSize] = useState(paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(0)
  const [total, setTotal] = useState(1)
  const [isActive, setIsActive] = useState(true)
  const pageCount = Math.ceil(total / pageSize)

  const fetchData = (page, count, active) => {
    setValidators({ data: {}, loading: true, error: false })

    Api.getValidators(page, count, 'desc', active)
      .then(res => {
        fetchHandlerSuccess(setValidators, res)
        setTotal(res.pagination.total)
      })
      .catch(err => fetchHandlerError(setValidators, err))
  }

  useEffect(() => setCurrentPage(0), [pageSize])
  useEffect(() => fetchData(paginateConfig.defaultPage, pageSize, isActive), [pageSize])
  useEffect(() => fetchData(currentPage + 1, pageSize, isActive), [isActive, pageSize, currentPage])

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
                onChange={e => setIsActive(e === 'Active')}
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
                    defaultValue={paginateConfig.pageSize.default}
                    items={paginateConfig.pageSize.values}
                />
              </div>
            }
        </Container>
    </Container>
  )
}

export default Validators
