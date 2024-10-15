'use client'

import { useState, useEffect, useCallback } from 'react'
import * as Api from '../../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, getTimeDelta } from '../../../util'
import { LoadingList } from '../../../components/loading'
import Pagination from '../../../components/pagination'
import { ErrorMessageBlock } from '../../../components/Errors'
import BlocksList from '../../../components/blocks/BlocksList'
import TransactionsList from '../../../components/transactions/TransactionsList'
import TransfersList from '../../../components/transfers/TransfersList'
import BlocksChart from './BlocksChart'
import Link from 'next/link'
import { Identifier, DateBlock, Endpoint, IpAddress, InfoLine } from '../../../components/data'
import { ValueContainer, PageDataContainer, InfoContainer } from '../../../components/ui/containers'
import { HorisontalSeparator } from '../../../components/ui/separators'
import { ValidatorCard } from '../../../components/validators'
import { CircleIcon } from '../../../components/ui/icons'
import { RateTooltip } from '../../../components/ui/Tooltips'
import './ValidatorPage.scss'
import {
  Container,
  Badge,
  Tabs, TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react'

function Validator ({ hash }) {
  const [validator, setValidator] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const [proposedBlocks, setProposedBlocks] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const pageSize = 13
  const [currentPage, setCurrentPage] = useState(1)
  const [transactions, setTransactions] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [transfers, setTransfers] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [activeChartTab, setActiveChartTab] = useState(0)

  const poseStatusColor = (validator.data?.proTxInfo?.state?.PoSeBanHeight > 0 &&
    validator.data?.proTxInfo?.state?.PoSeRevivedHeight === -1)
      ? 'red.default'
      : validator.data?.proTxInfo?.state?.PoSePenalty > 0
        ? 'yellow.default'
        : 'green.default'

  const fetchData = () => {
    Api.getValidatorByProTxHash(hash)
      .then(res => fetchHandlerSuccess(setValidator, res))
      .catch(err => fetchHandlerError(setValidator, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }

  useEffect(() => fetchData(), [hash])

  useEffect(() => {
    setProposedBlocks(state => ({ ...state, loading: true }))

    Api.getBlocksByValidator(hash, proposedBlocks.props.currentPage + 1, pageSize, 'desc')
      .then((res) => fetchHandlerSuccess(setProposedBlocks, res))
      .catch(err => fetchHandlerError(setProposedBlocks, err))
  }, [proposedBlocks.props.currentPage])

  useEffect(() => {
    if (!validator.data?.identity) return
    setTransactions(state => ({ ...state, loading: true }))

    const identifier = validator.data.identity
    // const identifier = 'HVfqSPfdmiHsrajx7EmErGnV597uYdH3JGhvwpVDcdAT' // test

    Api.getTransactionsByIdentity(identifier, transactions.props.currentPage + 1, pageSize, 'desc')
      .then(res => fetchHandlerSuccess(setTransactions, res))
      .catch(err => fetchHandlerError(setTransactions, err))
  }, [validator, transactions.props.currentPage])

  useEffect(() => {
    if (!validator.data?.identity) return
    setTransfers(state => ({ ...state, loading: true }))

    const identifier = validator.data.identity

    Api.getTransfersByIdentity(identifier, transfers.props.currentPage + 1, pageSize, 'desc')
      .then(res => fetchHandlerSuccess(setTransfers, res))
      .catch(err => fetchHandlerError(setTransfers, err))
  }, [validator, transfers.props.currentPage])

  function paginationHandler (setter, currentPage) {
    setter(state => ({
      ...state,
      props: {
        ...state.props,
        currentPage
      }
    }))
  }

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
          <InfoContainer className={'ValidatorPage__GroupContainer'}>
            <ValidatorCard validator={validator} rate={rate} className={'ValidatorPage__Card'}/>

            <div>
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'CORE P2P'}
                value={(
                  <Endpoint
                    value={<IpAddress>{validator.data?.proTxInfo?.state?.endpoints?.coreP2P?.host}</IpAddress>}
                    status={validator.data?.proTxInfo?.state?.endpoints?.coreP2P?.status || 'error'}
                  />
                )}
                loading={validator.loading}
                error={validator.error || !validator.data?.proTxInfo?.state?.endpoints?.coreP2P}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Platform P2P'}
                value={(
                  <Endpoint
                    value={<IpAddress>{validator.data?.proTxInfo?.state?.endpoints?.platformP2P?.host}</IpAddress>}
                    status={validator.data?.proTxInfo?.state?.endpoints?.platformP2P?.status || 'error'}
                  />
                )}
                loading={validator.loading}
                error={validator.error || !validator.data?.proTxInfo?.state?.endpoints?.platformP2P}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Platform GRPC'}
                value={(
                  <Endpoint
                    value={<IpAddress>{validator.data?.proTxInfo?.state?.endpoints?.platformGrpc?.host}</IpAddress>}
                    status={validator.data?.proTxInfo?.state?.endpoints?.platformGrpc?.status || 'error'}
                    link={'https://192.168.0.1:9999'}
                  />
                )}
                loading={validator.loading}
                error={validator.error || !validator.data?.proTxInfo?.state?.endpoints?.platformGrpc}
              />
            </div>

            <HorisontalSeparator/>

            <div>
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Status'}
                value={(
                  <Badge colorScheme={validator?.data?.isActive ? 'green' : 'orange'}>
                    {validator?.data?.isActive
                      ? 'Proposing'
                      : 'Waiting for Quorum'}
                  </Badge>
                )}
                loading={validator.loading}
                error={validator.error}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Epoch'}
                value={`#${validator.data?.epochInfo?.number }`}
                loading={validator.loading}
                error={validator.error || !validator.data?.epochInfo?.number}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Next epoch starts in'}
                value={getTimeDelta(new Date(), new Date(validator.data?.epochInfo?.endTime), 'detailed')}
                loading={validator.loading}
                error={validator.error || !validator.data?.epochInfo?.endTime}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Rewards This Epoch'}
                value={(
                  <RateTooltip credits={validator.data?.epochReward} rate={rate.data}>
                    {validator.data?.epochReward}
                  </RateTooltip>
                )}
                loading={validator.loading}
                error={validator.error || !(typeof validator.data?.epochReward === 'number')}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Total Rewards Earned'}
                value={(
                  <RateTooltip credits={validator.data?.totalReward} rate={rate.data}>
                    {validator.data?.epochReward}
                  </RateTooltip>
                )}
                loading={validator.loading}
                error={validator.error || !(typeof validator.data?.totalReward === 'number')}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Last Proposed Block'}
                value={(
                  <Link href={`/block/${validator.data?.lastProposedBlockHeader?.hash}`}>
                    <ValueContainer className={'ValidatorPage__ValueContainer'} clickable={true}>
                      {validator.data?.lastProposedBlockHeader?.timestamp &&
                        <DateBlock
                          timestamp={validator.data.lastProposedBlockHeader.timestamp}
                          format={'delta-only'}
                        />
                      }
                      <Identifier ellipsis={false} styles={['highlight-both']}>
                        {validator.data?.lastProposedBlockHeader?.hash || ''}
                      </Identifier>
                    </ValueContainer>
                  </Link>
                )}
                loading={validator.loading}
                error={validator.error || !validator.data?.lastProposedBlockHeader?.hash}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Withdrawals Count'}
                value={validator.data?.withdrawalsCount}
                loading={validator.loading}
                error={validator.error || typeof validator.data?.withdrawalsCount !== 'number'}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Last Withdrawal'}
                value={(
                  <Link href={`/transaction/${validator.data?.lastWithdrawal}`}>
                    <ValueContainer className={'ValidatorPage__ValueContainer'} clickable={true}>
                      {validator.data?.lastWithdrawalTime &&
                        <DateBlock timestamp={validator.data.lastWithdrawalTime} format={'delta-only'}/>}
                      <Identifier ellipsis={false} styles={['highlight-both']}>
                        {validator.data?.lastWithdrawal}
                      </Identifier>
                    </ValueContainer>
                  </Link>
                )}
                loading={validator.loading}
                error={validator.error || !validator.data?.lastWithdrawal}
              />
            </div>

            <HorisontalSeparator/>

            <div>
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'PoSe Score'}
                value={(
                  <div className={'ValidatorPage__PoseScroreValue'}>
                    <span>
                      {validator.data?.proTxInfo?.state?.PoSePenalty}
                    </span>
                    <CircleIcon w={'8px'} h={'8px'} ml={'4px'} mb={'-1px'} color={poseStatusColor}/>
                  </div>
                )}
                loading={validator.loading}
                error={validator.error || typeof validator.data?.proTxInfo?.state?.PoSePenalty !== 'number'}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Collateral address'}
                value={(
                  <ValueContainer className={'ValidatorPage__ValueContainer'} clickable={true}>
                    <Identifier styles={['highlight-both']} ellipsis={false}>
                      {validator.data?.proTxInfo?.collateralAddress || ''}
                    </Identifier>
                  </ValueContainer>
                )}
                loading={validator.loading}
                error={validator.error}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Owner address'}
                value={(
                  <ValueContainer className={'ValidatorPage__ValueContainer'} clickable={true}>
                    <Identifier styles={['highlight-both']} ellipsis={false}>
                      {validator.data?.proTxInfo?.state?.ownerAddress || ''}
                    </Identifier>
                  </ValueContainer>
                )}
                loading={validator.loading}
                error={validator.error}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Voting address'}
                value={(
                  <ValueContainer className={'ValidatorPage__ValueContainer'} clickable={true}>
                    <Identifier styles={['highlight-both']} ellipsis={false}>
                    {validator.data?.proTxInfo?.state?.votingAddress || ''}
                    </Identifier>
                  </ValueContainer>
                )}
                loading={validator.loading}
                error={validator.error}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Payout address'}
                value={(
                  <ValueContainer className={'ValidatorPage__ValueContainer'} clickable={true}>
                    <Identifier styles={['highlight-both']} ellipsis={false}>
                      {validator.data?.proTxInfo?.state?.payoutAddress || ''}
                    </Identifier>
                  </ValueContainer>
                )}
                loading={validator.loading}
                error={validator.error}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Operator Public Key'}
                value={(
                  <Identifier copyButton={true} styles={['highlight-both']} ellipsis={false}>
                    {validator.data?.proTxInfo?.state?.pubKeyOperator || ''}
                  </Identifier>
                )}
                loading={validator.loading}
                error={validator.error}
              />
            </div>
          </InfoContainer>
        </div>

        <div className={'ValidatorPage__Column'}>
          <InfoContainer styles={['tabs']}>
            <Tabs onChange={(index) => setActiveChartTab(index)}>
              <TabList>
                <Tab>Proposed Blocks</Tab>
                <Tab>Reward Earned</Tab>
              </TabList>
              <TabPanels>
                  <TabPanel height={'300px'} position={'relative'}>
                    <BlocksChart
                      blockBorders={false}
                      hash={hash}
                      isActive={activeChartTab === 0}
                    />
                  </TabPanel>
                  <TabPanel height={'400px'}>
                    Reward Earned
                  </TabPanel>
              </TabPanels>
            </Tabs>
          </InfoContainer>

          <InfoContainer styles={['tabs']} className={'ValidatorPage__Lists'}>
            <Tabs style={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1
            }}>
              <TabList>
                <Tab>Proposed Blocks</Tab>
                <Tab>Transactions</Tab>
                <Tab>Withdrawals</Tab>
              </TabList>
              <TabPanels style={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1
              }}>
                <TabPanel className={'ValidatorPage__ListContainer'}>
                  {!proposedBlocks.error
                    ? <div className={'ValidatorPage__List'}>
                        {!proposedBlocks.loading
                          ? <BlocksList blocks={proposedBlocks?.data?.resultSet} headerStyles={'light'}/>
                          : <LoadingList itemsCount={pageSize}/>
                        }
                      </div>
                    : <Container h={20}><ErrorMessageBlock/></Container>
                  }

                  {proposedBlocks.data?.resultSet?.length > 0 &&
                    <div className={'ValidatorPage__ListPagination'}>
                      <Pagination
                        onPageChange={pagination => paginationHandler(setProposedBlocks, pagination.selected)}
                        pageCount={Math.ceil(proposedBlocks.data?.pagination?.total / pageSize) || 1}
                        forcePage={currentPage}
                      />
                    </div>
                  }
                </TabPanel>
                <TabPanel className={'ValidatorPage__ListContainer'}>
                  {!transactions.error
                    ? <div className={'ValidatorPage__List'}>
                        {!transactions.loading
                          ? <TransactionsList
                              transactions={transactions.data.resultSet}
                              headerStyles={'light'}
                            />
                          : <LoadingList itemsCount={pageSize}/>}
                      </div>
                    : <Container h={20}><ErrorMessageBlock/></Container>}

                  {transactions.data?.resultSet?.length > 0 &&
                    <div className={'ValidatorPage__ListPagination'}>
                      <Pagination
                        className={'ValidatorPage__ListPagination'}
                        onPageChange={pagination => paginationHandler(setTransactions, pagination.selected)}
                        pageCount={Math.ceil(transactions.data?.pagination?.total / pageSize) || 1}
                        forcePage={currentPage}
                      />
                    </div>
                  }
                </TabPanel>
                <TabPanel className={'ValidatorPage__ListContainer'}>
                  {!transfers.error
                    ? !transfers.loading
                        ? <TransfersList transfers={transfers.data.resultSet} identityId={validator.data?.identity}/>
                        : <LoadingList itemsCount={pageSize}/>
                    : <Container h={20}><ErrorMessageBlock/></Container>}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </InfoContainer>
        </div>
      </div>
    </PageDataContainer>
  )
}

export default Validator
