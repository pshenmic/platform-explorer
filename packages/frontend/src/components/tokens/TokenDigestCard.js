import { CreditsBlock, Identifier, InfoLine } from '../data'
import { ValueContainer } from '../ui/containers'
import { Supply } from './'
import {
  TokenMintIcon,
  TokenTotalIcon,
  TokenBurnIcon,
  TokenFreezeIcon,
  TransactionsIcon,
  MembersIcon
} from '../ui/icons'
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
        <ValueContainer className={'TokenDigestCard__SupplyCardContainer'}>
          <div className={'TokenDigestCard__SupplyCard'}>
            <div className={'TokenDigestCard__CurrentSupplyTitle'}>
              <TokenMintIcon/>
              <span className={'TokenDigestCard__SupplyCardTitle'}>Minted</span>
            </div>

            <div className={'TokenDigestCard__SupplyData'}>
              <Supply
                currentSupply={mockData.minted}
                maxSupply={mockData.maxSupply}
                progressPosition="bottom"
              />
            </div>

            <div className={'TokenDigestCard__TotalSupplyTitle'}>
              <span className={'TokenDigestCard__SupplyFooterTitle'}>Total<br/>Supply</span>
              <TokenTotalIcon/>
            </div>
          </div>
        </ValueContainer>
      </div>

      {/* Middle Row - Stats Cards */}
      <div className={'TokenDigestCard__StatsCards'}>
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
      <div className={'TokenDigestCard__BurnFreezeCards'}>
        <ValueContainer>
          <div className={'TokenDigestCard__StatCard'}>
            <div className={'TokenDigestCard__StatHeader'}>
              <TokenBurnIcon />
              <span className={'TokenDigestCard__StatTitle'}>Burnt:</span>
            </div>
            <div className={'TokenDigestCard__StatValue'}>
              {mockData.burnt}
            </div>
          </div>
        </ValueContainer>

        <ValueContainer>
          <div className={'TokenDigestCard__StatCard'}>
            <div className={'TokenDigestCard__StatHeader'}>
              <TokenFreezeIcon />
              <span className={'TokenDigestCard__StatTitle'}>Frozen:</span>
            </div>
            <div className={'TokenDigestCard__StatValue'}>
              {mockData.frozen}
            </div>
          </div>
        </ValueContainer>
      </div>

      {/* Distribution Type */}
      <div className={'TokenDigestCard__DistributionType'}>
        <span className={'TokenDigestCard__DistributionLabel'}>Distribution Type:</span>
        <ValueContainer colorScheme={'green'} size={'sm'}>
          <span className={'TokenDigestCard__DistributionValue'}>
            {mockData.distributionType}
          </span>
          <div className={'TokenDigestCard__DistributionIcon'}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="8" fill="#58F4BC"/>
              <path d="M8 4V8" stroke="#181F22" strokeWidth="1.78" strokeLinecap="round"/>
            </svg>
          </div>
        </ValueContainer>
      </div>

      <InfoLine
        className={'TokenDigestCard__InfoLine'}
        title={'Token Creator'}
        value={(
          <ValueContainer link={`identity/${mockData.tokenCreator}`} className={'TokenDigestCard__ValueContainer'} clickable={false}>
            <Identifier avatar={true} copyButton={true} styles={['highlight-both']} ellipsis={false}>
              {mockData.tokenCreator}
            </Identifier>
          </ValueContainer>
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
