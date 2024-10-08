'use client'

import { useState, useEffect, useCallback } from 'react'
import * as Api from '../../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { LoadingLine, LoadingList } from '../../../components/loading'
import Pagination from '../../../components/pagination'
import PageSizeSelector from '../../../components/pageSizeSelector/PageSizeSelector'
import { ErrorMessageBlock } from '../../../components/Errors'
import BlocksList from '../../../components/blocks/BlocksList'
import ImageGenerator from '../../../components/imageGenerator'
import BlocksChart from './BlocksChart'
import Link from 'next/link'
import { Identifier, DateBlock, Endpoint, IpAddress, InfoLine } from '../../../components/data'
import { ValueContainer, PageDataContainer } from '../../../components/ui/containers'
import { HorisontalSeparator } from '../../../components/ui/separators'
import { ValidatorCard } from '../../../components/validators'
import { CircleIcon } from '../../../components/ui/icons'
import './ValidatorPage.scss'
import {
  Container,
  TableContainer, Table, Thead, Tbody, Tr, Th, Td,
  Grid, GridItem,
  Heading,
  Box,
  Badge
} from '@chakra-ui/react'

const paginateConfig = {
  pageSize: {
    default: 25,
    values: [10, 25, 50, 75, 100]
  },
  defaultPage: 1
}

// function Credits ({ credits, usd, format }) {
//   return (
//     <div>
//       <span>{credits} CREDITS</span>
//       <span>({credits / 1000} DASH)</span>
//       <span>~{usd}$</span>
//     </div>
//   )
// }

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
    <PageDataContainer
      className={'ValidatorPage'}
      backLink={'/validators'}
      title={'Validator Info'}
    >
      <div className={'ValidatorPage__ContentContainer'}>
        <div className={'ValidatorPage__Column'}>
          <div className={'ValidatorPage__GroupContainer'}>
            <ValidatorCard validator={validator} className={'ValidatorPage__Card'}/>
            <div>
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'CORE P2P'}
                value={(
                  <Endpoint
                    value={<IpAddress address={'192.168.0.1'} port={'9999'}/>}
                    status={'active'}
                    link={'https://192.168.0.1'}
                  />
                )}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Platform P2P'}
                value={(
                  <Endpoint
                    value={<IpAddress address={'192.168.0.1'} port={'9999'}/>}
                    status={'active'}
                  />
                )}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Platform GRPC'}
                value={(
                  <Endpoint
                    value={<IpAddress address={'192.168.0.1'} port={'9999'}/>}
                    status={'active'}
                  />
                )}
              />
            </div>

            <HorisontalSeparator/>

            <div>
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Status'}
                value={(
                  <Badge colorScheme={false ? 'green' : 'orange'}>
                    {false
                      ? '1'
                      : 'Waiting for Quorum'}
                  </Badge>
                )}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Epoch'}
                value={'#1343'}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Next epoch starts in'}
                value={'10d:5h:13m'}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Rewards This Epoch'}
                value={'85,80'}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Rewards This Epoch'}
                value={'825,280'}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Last Proposed Block'}
                value={(
                  <ValueContainer className={'ValidatorPage__ValueContainer'}>
                    <DateBlock timestamp={1727887511000} format={'delta-only'}/>
                    <Identifier ellipsis={false} styles={['highlight-both']}>
                      XsX1yMuyEwd3gYce8QD3m1v5G8X4MSCty4
                    </Identifier>
                  </ValueContainer>
                )}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Withdrawals Count'}
                value={'42'}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Last Withdrawal'}
                value={(
                  <ValueContainer className={'ValidatorPage__ValueContainer'}>
                    <DateBlock timestamp={1727887511000} format={'delta-only'}/>
                    <Identifier ellipsis={false} styles={['highlight-both']}>
                      XsX1yMuyEwd3gYce8QD3m1v5G8X4MSCty4
                    </Identifier>
                  </ValueContainer>
                )}
              />
            </div>

            <HorisontalSeparator/>

            <div>
              {/* PoSe Score and etc. */}

              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'PoSe Score'}
                value={(
                  <div className={'ValidatorPage__PoseScroreValue'}>
                    <span>0</span>
                    <CircleIcon w={'8px'} h={'8px'} ml={'4px'} mb={'-1px'} color={'green.default'}/>
                  </div>
                )}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Collateral address'}
                value={(
                  <ValueContainer className={'ValidatorPage__ValueContainer'}>
                    <Identifier styles={['highlight-both']}>
                      XsX1yMuyEwd3gYce8QD3m1v5G8X4MSCty4
                    </Identifier>
                  </ValueContainer>
                )}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Owner address'}
                value={(
                  <ValueContainer className={'ValidatorPage__ValueContainer'}>
                    <Identifier styles={['highlight-both']}>
                      XsX1yMuyEwd3gYce8QD3m1v5G8X4MSCty4
                    </Identifier>
                  </ValueContainer>
                )}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Voting address'}
                value={(
                  <ValueContainer className={'ValidatorPage__ValueContainer'}>
                    <Identifier styles={['highlight-both']}>
                      XsX1yMuyEwd3gYce8QD3m1v5G8X4MSCty4
                    </Identifier>
                  </ValueContainer>
                )}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Payout address'}
                value={(
                  <ValueContainer className={'ValidatorPage__ValueContainer'}>
                    <Identifier styles={['highlight-both']}>
                      XsX1yMuyEwd3gYce8QD3m1v5G8X4MSCty4
                    </Identifier>
                  </ValueContainer>
                )}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Operator Public Key'}
                value={(
                  <Identifier copyButton={true} styles={['highlight-both']}>
                    XsX1yMuyEwd3gYce8QD3m1v5G8X4MSCty4
                  </Identifier>
                )}
              />
            </div>
          </div>
        </div>

        <div className={'ValidatorPage__Column'}>
          <div>
            <BlocksChart blockBorders={false} height={'300px'} hash={hash}/>
          </div>
          <div>
            <div>Proposed Blocks</div>

            {!proposedBlocks.error
              ? <>
                  {!proposedBlocks.loading
                    ? <BlocksList blocks={proposedBlocks?.data?.resultSet}/>
                    : <LoadingList itemsCount={pageSize}/>
                  }
                </>
              : <Container h={20}><ErrorMessageBlock/></Container>
            }

          </div>
        </div>
      </div>
    </PageDataContainer>
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
