import { CreditsBlock, Identifier, InfoLine } from '../data'
import { ValueContainer } from '../ui/containers'
import { Supply } from './'
import {
  TokenMintIcon,
  TokenTotalIcon,
  TokenBurnIcon,
  TokenFreezeIcon,
  TransactionsIcon,
  MembersIcon,
  InfoIcon
} from '../ui/icons'
import { ValueCard } from '../cards'
import { Flex } from '@chakra-ui/react'
import './TokenDigestCard.scss'

function TokenDigestCard ({ token, className, loading, error }) {
  const mockData = {
    minted: 342342941941,
    maxSupply: 100000000000000,
    totalTransactions: 42941,
    holders: 5213,
    burnt: 0,
    frozen: 0,
    distributionType: 'Step Decreasing Amount',
    tokenCreator: 'Cgjuqav7uD7FnWNqNyHEWet382Yzx7NYNRUNqfJ3d2je',
    totalGasSpent: 2185800000,
    gasSpentInDash: 8.523,
    gasSpentInUsd: 2209.15
  }

  return (
    <div className={`TokenDigestCard ${className || ''} ${token?.loading ? 'TokenDigestCard--Loading' : ''}`}>
      <div className={'TokenDigestCard__TopCards'}>
        <ValueContainer className={'TokenDigestCard__SupplyCardContainer'} size={'xl'}>
          <Supply
            currentSupply={mockData.minted}
            maxSupply={mockData.maxSupply}
            progressPosition={'bottom'}
            showTitles={true}
            showIcons={true}
            minTitle={'Minted'}
            maxTitle={<>Total<br/>Supply</>}
            topIcon={<TokenMintIcon/>}
            bottomIcon={<TokenTotalIcon/>}
            className={'TokenDigestCard__SupplyCard'}
          />
        </ValueContainer>
      </div>

      {/* Middle Row - Stats Cards */}
      <div className={'TokenDigestCard__RowContainer'}>
        <ValueContainer size={'xl'}>
          <InfoLine
            title={<>Total<br/>Transactions</>}
            value={mockData.totalTransactions}
            icon={<TransactionsIcon/>}
            loading={loading}
            error={error}
          />
        </ValueContainer>

        <ValueContainer size={'xl'}>
          <InfoLine
            title={'Holders'}
            icon={<MembersIcon/>}
            value={mockData.holders}
            loading={loading}
            error={error}
          />
        </ValueContainer>
      </div>

      {/* Burn and Freeze Row */}
      <div className={'TokenDigestCard__RowContainer'}>
        <ValueContainer>
          <InfoLine
            title={'Burnt'}
            value={mockData.burnt}
            icon={<TokenBurnIcon/>}
            loading={loading}
            error={error}
          />
        </ValueContainer>

        <ValueContainer>
          <InfoLine
            title={'Frozen'}
            value={mockData.frozen}
            icon={<TokenFreezeIcon/>}
            loading={loading}
            error={error}
          />
        </ValueContainer>
      </div>

      <InfoLine
        title={'Distribution Type'}
        value={
          <ValueContainer colorScheme={'emeralds'} size={'sm'}>
            <Flex gap={'0.5rem'} alignItems={'center'}>
              {mockData.distributionType}
              <InfoIcon width={'1rem'} height={'1rem'} color={'#58F4BC'}/>
            </Flex>
          </ValueContainer>
        }
        loading={loading}
        error={error}
      />

      <InfoLine
        className={'TokenDigestCard__InfoLine'}
        title={'Token Creator'}
        value={(
          <ValueCard link={`identity/${mockData.tokenCreator}`} className={'TokenDigestCard__ValueContainer'} clickable={false}>
            <Identifier avatar={true} copyButton={true} styles={['highlight-both']} ellipsis={false}>
              {mockData.tokenCreator}
            </Identifier>
          </ValueCard>
        )}
        loading={token?.loading}
        error={token?.error || (!token?.loading && !mockData.tokenCreator)}
      />

      <InfoLine
        className={'TokenDigestCard__InfoLine'}
        title={'Total Gas Spent'}
        value={<CreditsBlock credits={mockData.totalGasSpent} rate={null}/>}
        loading={token?.loading}
        error={token?.error || (!token?.loading && mockData.totalGasSpent === undefined)}
      />
    </div>
  )
}

export default TokenDigestCard
