'use client'

import { useState, useEffect, useCallback } from 'react'
import * as Api from '../../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, getTimeDelta } from '../../../util'
import { LoadingLine, LoadingList } from '../../../components/loading'
import Pagination from '../../../components/pagination'
import PageSizeSelector from '../../../components/pageSizeSelector/PageSizeSelector'
import { ErrorMessageBlock } from '../../../components/Errors'
import BlocksList from '../../../components/blocks/BlocksList'
import ImageGenerator from '../../../components/imageGenerator'
import BlocksChart from './BlocksChart'
import Link from 'next/link'
import { Identifier } from '../../../components/data'
import {
  Container,
  TableContainer, Table, Thead, Tbody, Tr, Th, Td,
  Grid, GridItem,
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

function InfoLine ({ title, value, className }) {
  return (
    <div className={`InfoLine ${className}`}>
      <div className={'InfoLine__Title'}>{title}:</div>
      <div className={'InfoLine__Value'}>{value}</div>
    </div>
  )
}

function Credits ({ credits, usd, format }) {
  return (
    <div>
      <span>{credits} CREDITS</span>
      <span>({credits / 1000} DASH)</span>
      <span>~{usd}$</span>
    </div>
  )
}

function DateBlock ({ timestamp }) {
  const date = new Date(timestamp)

  if (String(date) === 'Invalid Date') return null

  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }

  const formattedDate = date.toLocaleDateString('en-GB', options)

  return (
    <div>
      <div>{formattedDate}</div>
      <div>
        {getTimeDelta(new Date(), date)}
      </div>
    </div>
  )
}

function HorisontalSeparator () {
  return <div className={'HorisontalSeparator'}></div>
}

function Endpoint ({ value, status, link }) {
  const statusClass = (() => {
    if (status === 'active') return 'Endpoint__Status--Active'
    if (status === 'warining') return 'Endpoint__Status--Warning'
    if (status === 'error') return 'Endpoint__Status--Error'
    return ''
  })()

  return (
    <div className={'Endpoint'}>
      <div className={'Endpoint__Value'}>{value}</div>
      {status !== undefined &&
        <div className={`Endpoint__Status ${statusClass}`}></div>
      }
    </div>
  )
}

function IpAddress ({ address, port, className }) {
  return (
    <div className={`IpAddress ${className}`}>
      <span className={'IpAddress__Ip'}>{address}</span>
      <span className={'IpAddress__Port'}>{port}</span>
    </div>
  )
}

function Validator ({ hash }) {
  const [validator, setValidator] = useState({ data: {}, loading: true, error: false })
  const [proposedBlocks, setProposedBlocks] = useState({ data: {}, loading: true, error: false })
  const [totalBlocks, setTotalBlocks] = useState(1)
  const tdTitleWidth = 250
  const [pageSize, setPageSize] = useState(paginateConfig.pageSize.default)
  const [currentPage, setCurrentPage] = useState(1)
  const pageCount = Math.ceil(totalBlocks / pageSize) ? Math.ceil(totalBlocks / pageSize) : 1

  const fetchData = (page, count) => {
    setProposedBlocks(state => ({ ...state, loading: true }))

    Api.getValidatorByProTxHash(hash)
      .then(res => fetchHandlerSuccess(setValidator, res))
      .catch(err => fetchHandlerError(setValidator, err))

    Api.getBlocksByValidator(hash, page, count, 'desc')
      .then((res) => {
        fetchHandlerSuccess(setProposedBlocks, res)
        setTotalBlocks(res?.pagination?.total)
      })
      .catch(err => fetchHandlerError(setProposedBlocks, err))
  }

  useEffect(() => fetchData(paginateConfig.defaultPage, paginateConfig.pageSize.default), [hash])

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
      className={'PageInfoContainer'}
      maxW={'container.xl'}
      p={3}
      mt={8}
      bg={'gray'}
    >
      <div className={'PageInfoContainer__Header'}>
        <div className={'PageInfoContainer__BackLink'}>{'<'}</div>
        <div className={'PageInfoContainer__Title'}>Validator Info</div>
      </div>

      <div>
        <div className={'PageInfoColumn'}>
          <div>
            <div className={'ValidatorCard'}>
              <div className={'ValidatorCard__Header'}>
                <div className={'ValidatorCard__Avatar'}></div>

                <InfoLine
                  title={'Pro TX Hash'}
                  value={(
                    <Identifier
                      className={''}
                      copyButton={true}
                      styles={['gradient-both']}
                    >
                      {hash}
                    </Identifier>
                  )}
                />

                <InfoLine
                  title={'Balance'}
                  value={<Credits credits={85800000} usd={'209.15'} />}
                />
              </div>

              <HorisontalSeparator/>

              <InfoLine
                title={'Creation Date'}
                value={<DateBlock timestamp={1727887511000}/>}
              />

              <InfoLine
                title={'Block Height'}
                value={'#10225'}
              />

              <InfoLine
                title={'Identity Address'}
                value={(
                  <Identifier
                    className={''}
                    copyButton={true}
                    styles={['gradient-both']}
                  >
                    23975732199C674FD2133FA9F08454D809561DC24E6E941D78FF414C528ABA67
                  </Identifier>
                )}
              />

              <InfoLine
                title={'Node ID'}
                value={(
                  <Identifier
                    className={''}
                    copyButton={true}
                    styles={['gradient-both']}
                  >
                    50d847734406592420320c864eb572fb900e5c36
                  </Identifier>
                )}
              />
            </div>

            {/* Endpoints */}

            <InfoLine
              title={'CORE P2P'}
              value={(
                <Identifier
                  className={''}
                  copyButton={true}
                  styles={['gradient-both']}
                >
                  <Endpoint
                    value={<IpAddress address={'192.168.0.1'} port={'9999'}/>}
                    status={'active'}
                  />
                </Identifier>
              )}
            />

            <InfoLine
              title={'Platform P2P'}
              value={(
                <Identifier
                  className={''}
                  copyButton={true}
                  styles={['gradient-both']}
                >
                  <Endpoint
                    value={<IpAddress address={'192.168.0.1'} port={'9999'}/>}
                    status={'active'}
                  />
                </Identifier>
              )}
            />

            <InfoLine
              title={'Platform GRPC'}
              value={(
                <Identifier
                  className={''}
                  copyButton={true}
                  styles={['gradient-both']}
                >
                  <Endpoint
                    value={<IpAddress address={'192.168.0.1'} port={'9999'}/>}
                    status={'active'}
                  />
                </Identifier>
              )}
            />
          </div>

          <HorisontalSeparator/>

          <div>
            {/* Status*/}
          </div>

          <HorisontalSeparator/>

          <div>
            {/* PoSe Score and etc. */}
          </div>
        </div>
        <div className={'PageInfoColumn'}> {/* Npobg */}
          {/* Chart */}
          {/* Proposed Blocks */}
        </div>
      </div>

    </Container>
  )

  return (
    <Container
      maxW={'container.lg'}
      p={3}
      mt={8}
    >
      <Grid
        w={'100%'}
        mb={5}
        gap={5}
        templateColumns={['1fr', '1fr', '1fr', '1fr 1fr']}
      >
        <GridItem p={0} height={'100%'}>
          <TableContainer
            width={'100%'}
            height={'100%'}
            maxW={'none'}
            borderWidth={'1px'} borderRadius={'block'}
            m={0}
            display={'block'}
          >
            {!validator.error
              ? <Table variant={'simple'} className={'Table'}>
                  <Thead>
                    <Tr>
                      <Th pr={0}>validator info</Th>
                      <Th className={'TableHeader TableHeader--Name'}>
                        {hash
                          ? <div className={'TableHeader__Content'}>
                              <ImageGenerator className={'TableHeader__Avatar'} username={hash} lightness={50} saturation={50} width={32} height={32}/>
                            </div>
                          : <Box w={'32px'} h={'32px'} />
                        }
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                  <Tr>
                      <Td w={tdTitleWidth}>ProTxHash</Td>
                      <Td isNumeric className={'Table__Cell--BreakWord Table__Cell--Mono'}>
                        <LoadingLine loading={validator.loading}>
                          <div>{hash}</div>
                        </LoadingLine>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td w={tdTitleWidth}>Identity</Td>
                      <Td isNumeric className={'Table__Cell--BreakWord Table__Cell--Mono'}>
                        <LoadingLine loading={validator.loading}>
                          {validator?.data?.identity
                            ? <Link href={`/identity/${validator.data.identity}`}>{validator.data.identity}</Link>
                            : '-'}
                        </LoadingLine>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td w={tdTitleWidth}>Status</Td>
                      <Td isNumeric>
                        <LoadingLine loading={validator.loading}>{validator?.data?.isActive ? 'Active' : 'Inactive'}</LoadingLine>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td w={tdTitleWidth}>Proposed blocks</Td>
                      <Td isNumeric>
                        <LoadingLine loading={validator.loading}>{validator?.data?.proposedBlocksAmount || '-'}</LoadingLine>
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              : <Container h={60}><ErrorMessageBlock/></Container>}
          </TableContainer>
        </GridItem>

        <GridItem height={'100%'} p={0}>
          <BlocksChart hash={hash}/>
        </GridItem>
      </Grid>

      <Container
        width={'100%'}
        maxW={'none'}
        mt={5}
        className={'InfoBlock'}
      >
        <Heading className={'InfoBlock__Title'} as={'h1'}>Proposed blocks</Heading>

        {!proposedBlocks.error
          ? <>
              {!proposedBlocks.loading
                ? <BlocksList blocks={proposedBlocks?.data?.resultSet}/>
                : <LoadingList itemsCount={pageSize}/>
              }
            </>
          : <Container h={20}><ErrorMessageBlock/></Container>
        }

        {proposedBlocks.data?.resultSet?.length > 0 &&
          <div className={'ListNavigation'}>
              <Box width={'155px'}/>
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
        }
      </Container>
    </Container>
  )
}

export default Validator
