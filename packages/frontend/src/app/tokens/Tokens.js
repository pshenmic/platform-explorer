'use client'

import { useEffect, useState } from 'react'
import TokensList from '../../components/tokens/TokensList'
import Pagination from '../../components/pagination'
import PageSizeSelector from '../../components/pageSizeSelector/PageSizeSelector'
import { LoadingList } from '../../components/loading'
import { ErrorMessageBlock } from '../../components/Errors'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Container, Heading, Box, useBreakpointValue } from '@chakra-ui/react'
import { TokenFilters } from '../../components/tokens'
import './Tokens.scss'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

// Mock data based on Figma design
const mockTokens = [
  {
    name: 'DashGold',
    ticker: 'DGLD',
    tokenId: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
    dataContract: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
    currentSupply: '40 MLN',
    maxSupply: '50 MLN',
    ownerIdentity: 'FXyN2NZAdRFADg7CeGjfUBdEqGPRw8RJXkpN5r4tMuLQ'
  },
  {
    name: 'CryptoSilver',
    ticker: 'CRSL',
    tokenId: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
    dataContract: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
    currentSupply: '40 MLN',
    maxSupply: '50 MLN',
    ownerIdentity: 'FXyN2NZAdRFADg7CeGjfUBdEqGPRw8RJXkpN5r4tMuLQ'
  },
  {
    name: 'TokenAlpha',
    ticker: 'ALPH',
    tokenId: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
    dataContract: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
    currentSupply: '40 MLN',
    maxSupply: '50 MLN',
    ownerIdentity: 'FXyN2NZAdRFADg7CeGjfUBdEqGPRw8RJXkpN5r4tMuLQ'
  },
  {
    name: 'BetaCoin',
    ticker: 'BTCN',
    tokenId: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
    dataContract: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
    currentSupply: '40 MLN',
    maxSupply: '50 MLN',
    ownerIdentity: 'FXyN2NZAdRFADg7CeGjfUBdEqGPRw8RJXkpN5r4tMuLQ'
  },
  {
    name: 'GammaToken',
    ticker: 'GMMT',
    tokenId: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
    dataContract: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
    currentSupply: '40 MLN',
    maxSupply: '50 MLN',
    ownerIdentity: 'FXyN2NZAdRFADg7CeGjfUBdEqGPRw8RJXkpN5r4tMuLQ'
  }
]

function Tokens ({ defaultPage = 1, defaultPageSize }) {
  const [tokens] = useState({ data: mockTokens, loading: false, error: false })
  const [total] = useState(mockTokens.length)
  const [pageSize, setPageSize] = useState(defaultPageSize || paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(defaultPage ? defaultPage - 1 : 0)
  const pageCount = Math.ceil(total / pageSize)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isMobile = useBreakpointValue({ base: true, md: false })

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

  // Get paginated tokens
  const paginatedTokens = mockTokens.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

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

        <div className={'Tokens__Controls'}>
          <TokenFilters
            // onFilterChange={filtersChangeHandler}
            isMobile={isMobile}
            className={'Tokens__Filters'}
          />
        </div>

        {!tokens.error
          ? !tokens.loading
              ? <TokensList tokens={paginatedTokens}/>
              : <LoadingList itemsCount={pageSize}/>
          : <ErrorMessageBlock h={20}/>
        }

        {tokens.data?.length > 0 &&
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
