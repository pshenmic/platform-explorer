'use client'

import { useState, useEffect, useCallback } from 'react'
import * as Api from '../../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError, paginationHandler } from '../../../util'
import { LoadingList } from '../../../components/loading'
import Pagination from '../../../components/pagination'
import { ErrorMessageBlock } from '../../../components/Errors'
import BlocksList from '../../../components/blocks/BlocksList'
import TransactionsList from '../../../components/transactions/TransactionsList'
import BlocksChart from './BlocksChart'
import RewardsChart from './RewardsChart'
import Link from 'next/link'
import { Identifier, DateBlock, Endpoint, IpAddress, InfoLine, BigNumber, TimeDelta } from '../../../components/data'
import { ValueContainer, PageDataContainer, InfoContainer } from '../../../components/ui/containers'
import { HorisontalSeparator } from '../../../components/ui/separators'
import { ValidatorCard } from '../../../components/validators'
import { CircleIcon } from '../../../components/ui/icons'
import { RateTooltip } from '../../../components/ui/Tooltips'
import { networks } from '../../../constants/networks'
import { WithdrawalsList } from '../../../components/transfers'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { defaultChartConfig } from '../../../components/charts/config'
import {
  Badge,
  Tabs, TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react'
import './ValidatorPage.scss'

function Validator ({ hash }) {
  const { setBreadcrumbs } = useBreadcrumbs()
  const [validator, setValidator] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const [proposedBlocks, setProposedBlocks] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const pageSize = 13
  const [currentPage, setCurrentPage] = useState(1)
  const [transactions, setTransactions] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [withdrawals, setWithdrawals] = useState({ data: {}, props: { currentPage: 0 }, loading: true, error: false })
  const [activeChartTab, setActiveChartTab] = useState(0)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const activeNetwork = networks.find(network => network.explorerBaseUrl === baseUrl)
  const l1explorerBaseUrl = activeNetwork?.l1explorerBaseUrl || null
  const [timespan, setTimespan] = useState(defaultChartConfig.timespan.values[defaultChartConfig.timespan.defaultIndex])

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Validators', path: '/validators' },
      { label: hash, avatar: true }
    ])
  }, [setBreadcrumbs, hash])

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

    Api.getTransactionsByIdentity(validator.data.identity, transactions.props.currentPage + 1, pageSize, 'desc')
      .then(res => fetchHandlerSuccess(setTransactions, res))
      .catch(err => fetchHandlerError(setTransactions, err))
  }, [validator, transactions.props.currentPage])

  useEffect(() => {
    if (!validator.data?.identity) return

    setWithdrawals(state => ({ ...state, loading: true }))

    Api.getWithdrawalsByIdentity(validator.data.identity, withdrawals.props.currentPage + 1, pageSize, 'desc')
      .then(res => fetchHandlerSuccess(setWithdrawals, res))
      .catch(err => fetchHandlerError(setWithdrawals, err))
  }, [validator, withdrawals.props.currentPage])

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
                    value={<IpAddress
                      host={validator.data?.endpoints?.coreP2PPortStatus?.host}
                      port={validator.data?.endpoints?.coreP2PPortStatus?.port}
                    />}
                    status={validator.data?.endpoints?.coreP2PPortStatus?.status || 'UNKNOWN'}
                    message={validator.data?.endpoints?.coreP2PPortStatus?.message}
                  />
                )}
                loading={validator.loading}
                error={validator.error || !validator.data?.endpoints?.coreP2PPortStatus}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Platform P2P'}
                value={(
                  <Endpoint
                    value={<IpAddress
                      host={validator.data?.endpoints?.platformP2PPortStatus?.host}
                      port={validator.data?.endpoints?.platformP2PPortStatus?.port}
                    />}
                    status={validator.data?.endpoints?.platformP2PPortStatus?.status || 'UNKNOWN'}
                    message={validator.data?.endpoints?.platformP2PPortStatus?.message}
                  />
                )}
                loading={validator.loading}
                error={validator.error || !validator.data?.endpoints?.platformP2PPortStatus}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Platform GRPC'}
                value={(
                  <Endpoint
                    value={(<IpAddress
                      host={validator.data?.endpoints?.platformGrpcPortStatus?.host}
                      port={validator.data?.endpoints?.platformGrpcPortStatus?.port}
                    />)}
                    status={validator.data?.endpoints?.platformGrpcPortStatus?.status || 'UNKNOWN'}
                    message={validator.data?.endpoints?.platformGrpcPortStatus?.message}
                    link={`https://${validator.data?.endpoints?.platformGrpcPortStatus?.host}${
                      validator.data?.endpoints?.platformGrpcPortStatus?.port
                        ? ':' + validator.data?.endpoints?.platformGrpcPortStatus?.port
                        : ''
                    }`}
                  />
                )}
                loading={validator.loading}
                error={validator.error || !validator.data?.endpoints?.platformGrpcPortStatus}
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
                value={`#${validator.data?.epochInfo?.number}`}
                loading={validator.loading}
                error={validator.error || !validator.data?.epochInfo?.number}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Next epoch starts in'}
                value={<TimeDelta endDate={validator.data?.epochInfo?.endTime} format={'detailed'}/>}
                loading={validator.loading}
                error={validator.error || !validator.data?.epochInfo?.endTime}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Rewards This Epoch'}
                value={(
                  <RateTooltip credits={validator.data?.epochReward} rate={rate.data}>
                    <span>
                      <BigNumber>{validator.data?.epochReward}</BigNumber>
                    </span>
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
                    <span>
                      <BigNumber>{validator.data?.totalReward}</BigNumber>
                    </span>
                  </RateTooltip>
                )}
                loading={validator.loading}
                error={validator.error || !(typeof validator.data?.totalReward === 'number')}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Blocks Proposed'}
                value={validator.data?.proposedBlocksAmount}
                loading={validator.loading}
                error={validator.error || typeof validator.data?.proposedBlocksAmount !== 'number'}
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
                          format={'deltaOnly'}
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
                        <DateBlock timestamp={validator.data.lastWithdrawalTime} format={'deltaOnly'}/>}
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
                  <a
                    href={l1explorerBaseUrl
                      ? `${l1explorerBaseUrl}/address/${validator.data?.proTxInfo?.collateralAddress}`
                      : '#'}
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                  >
                    <ValueContainer className={'ValidatorPage__ValueContainer'} clickable={true} external={true}>
                      <Identifier styles={['highlight-both']} ellipsis={false}>
                        {validator.data?.proTxInfo?.collateralAddress || ''}
                      </Identifier>
                    </ValueContainer>
                  </a>
                )}
                loading={validator.loading}
                error={validator.error || !validator.data?.proTxInfo?.collateralAddress}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Owner address'}
                value={(
                  <a
                    href={l1explorerBaseUrl
                      ? `${l1explorerBaseUrl}/address/${validator.data?.proTxInfo?.state?.ownerAddress}`
                      : '#'}
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                  >
                    <ValueContainer className={'ValidatorPage__ValueContainer'} clickable={true} external={true}>
                      <Identifier styles={['highlight-both']} ellipsis={false}>
                        {validator.data?.proTxInfo?.state?.ownerAddress || ''}
                      </Identifier>
                    </ValueContainer>
                  </a>
                )}
                loading={validator.loading}
                error={validator.error || !validator.data?.proTxInfo?.state?.ownerAddress}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Voting address'}
                value={(
                  <a
                    href={l1explorerBaseUrl
                      ? `${l1explorerBaseUrl}/address/${validator.data?.proTxInfo?.state?.votingAddress}`
                      : '#'}
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                  >
                    <ValueContainer className={'ValidatorPage__ValueContainer'} clickable={true} external={true}>
                      <Identifier styles={['highlight-both']} ellipsis={false}>
                      {validator.data?.proTxInfo?.state?.votingAddress || ''}
                      </Identifier>
                    </ValueContainer>
                  </a>
                )}
                loading={validator.loading}
                error={validator.error || !validator.data?.proTxInfo?.state?.votingAddress}
              />
              <InfoLine
                className={'ValidatorPage__InfoLine'}
                title={'Payout address'}
                value={(
                  <a
                    href={l1explorerBaseUrl
                      ? `${l1explorerBaseUrl}/address/${validator.data?.proTxInfo?.state?.payoutAddress}`
                      : '#'}
                    target={'_blank'}
                    rel={'noopener noreferrer'}
                  >
                    <ValueContainer className={'ValidatorPage__ValueContainer'} clickable={true} external={true}>
                      <Identifier styles={['highlight-both']} ellipsis={false}>
                        {validator.data?.proTxInfo?.state?.payoutAddress || ''}
                      </Identifier>
                    </ValueContainer>
                  </a>
                )}
                loading={validator.loading}
                error={validator.error || !validator.data?.proTxInfo?.state?.payoutAddress}
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
                error={validator.error || !validator.data?.proTxInfo?.state?.pubKeyOperator}
              />
            </div>
          </InfoContainer>
        </div>

        <div className={'ValidatorPage__Column'}>
          <InfoContainer styles={['tabs']} className={'ValidatorPage__ChartsContainer'}>
            <Tabs onChange={(index) => setActiveChartTab(index)} index={activeChartTab}>
              <TabList>
                <Tab>Proposed Blocks</Tab>
                <Tab>Reward Earned</Tab>
              </TabList>
              <TabPanels>
                  <TabPanel className={'ValidatorPage__ChartTab'} position={'relative'}>
                    <BlocksChart
                      hash={hash}
                      isActive={activeChartTab === 0}
                      loading={validator.loading}
                      timespanChangeCallback={setTimespan}
                      timespan={timespan}
                    />
                  </TabPanel>
                  <TabPanel className={'ValidatorPage__ChartTab'} position={'relative'}>
                    <RewardsChart
                      hash={hash}
                      isActive={activeChartTab === 1}
                      loading={validator.loading}
                      timespanChangeCallback={setTimespan}
                      timespan={timespan}
                    />
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
                          ? <BlocksList blocks={proposedBlocks?.data?.resultSet} headerStyles={'light'} absoluteDate={true}/>
                          : <LoadingList itemsCount={pageSize}/>
                        }
                      </div>
                    : <ErrorMessageBlock/>
                  }

                  {proposedBlocks.data?.resultSet &&
                    <div className={'ValidatorPage__ListPagination'}>
                      <Pagination
                        onPageChange={pagination => paginationHandler(setProposedBlocks, pagination.selected)}
                        pageCount={Math.ceil(proposedBlocks.data?.pagination?.total / pageSize) || 1}
                        forcePage={currentPage}
                        pageRangeDisplayed={0}
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
                    : <ErrorMessageBlock/>}

                  {transactions.data?.resultSet &&
                    <div className={'ValidatorPage__ListPagination'}>
                      <Pagination
                        onPageChange={pagination => paginationHandler(setTransactions, pagination.selected)}
                        pageCount={Math.ceil(transactions.data?.pagination?.total / pageSize) || 1}
                        forcePage={currentPage}
                        pageRangeDisplayed={0}
                      />
                    </div>
                  }
                </TabPanel>
                <TabPanel className={'ValidatorPage__ListContainer'}>
                  {!withdrawals.error
                    ? <div className={'ValidatorPage__List'}>
                        {!withdrawals.loading
                          ? <WithdrawalsList
                              withdrawals={withdrawals?.data?.resultSet || Object.values(withdrawals.data) || []}
                              l1explorerBaseUrl={l1explorerBaseUrl}
                              rate={rate.data}
                              defaultPayoutAddress={validator.data?.proTxInfo?.state?.payoutAddress}
                              headerStyles={'light'}
                            />
                          : <LoadingList itemsCount={pageSize}/>
                        }
                      </div>
                    : <ErrorMessageBlock/>
                  }

                  {withdrawals.data?.resultSet &&
                    <div className={'ValidatorPage__ListPagination'}>
                      <Pagination
                        onPageChange={pagination => paginationHandler(setWithdrawals, pagination.selected)}
                        pageCount={Math.ceil(withdrawals.data?.pagination?.total / pageSize) || 1}
                        forcePage={currentPage}
                        pageRangeDisplayed={0}
                      />
                    </div>
                  }
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
