import { CreditsBlock, Identifier, InfoLine } from '../data'
import { ValueContainer } from '../ui/containers'
import { Supply } from './'
import {
  TokenMintIcon,
  TokenTotalIcon,
  TokenBurnIcon,
  TokenFreezeIcon,
  TransactionsIcon,
  InfoIcon
} from '../ui/icons'
import { ValueCard } from '../cards'
import { Badge, Flex } from '@chakra-ui/react'
import './TokenDigestCard.scss'

function TokenDigestCard ({ token, rate, className, loading, error }) {
  const {
    totalSupply,
    maxSupply,
    owner,
    mintable,
    burnable,
    freezable,
    unfreezable,
    destroyable,
    allowedEmergencyActions,
    changeMaxSupply,
    distributionType,
    totalGasUsed,
    totalTransitionsCount,
    totalFreezeTransitionsCount,
    totalBurnTransitionsCount
  } = token?.data || {}

  return (
    <div className={`TokenDigestCard ${className || ''} ${token?.loading ? 'TokenDigestCard--Loading' : ''}`}>
      <div className={'TokenDigestCard__TopCards'}>
        <ValueContainer className={'TokenDigestCard__SupplyCardContainer'} size={'xl'}>
          <Supply
            currentSupply={totalSupply}
            maxSupply={maxSupply}
            progressPosition={'bottom'}
            showTitles={true}
            showIcons={true}
            minTitle={'Minted'}
            maxTitle={<>Total<br/>Supply</>}
            topIcon={<TokenMintIcon/>}
            bottomIcon={<TokenTotalIcon/>}
            className={'TokenDigestCard__SupplyCard'}
            loading={loading}
          />
        </ValueContainer>
      </div>

      <div className={'TokenDigestCard__RowContainer'}>
        <ValueContainer size={'xl'}>
          <InfoLine
            title={<>Total<br/>Transactions</>}
            value={totalTransitionsCount}
            icon={<TransactionsIcon/>}
            loading={loading}
            error={error || totalTransitionsCount == null}
          />
        </ValueContainer>
      </div>

      <div className={'TokenDigestCard__RowContainer'}>
        <ValueContainer size={'xl'}>
          <InfoLine
            title={'Burnt'}
            value={totalBurnTransitionsCount || 0}
            icon={<TokenBurnIcon/>}
            loading={loading}
            error={error || totalBurnTransitionsCount == null}
          />
        </ValueContainer>

        <ValueContainer size={'xl'}>
          <InfoLine
            title={'Frozen'}
            value={totalFreezeTransitionsCount || 0}
            icon={<TokenFreezeIcon/>}
            loading={loading}
            error={error || totalFreezeTransitionsCount == null}
          />
        </ValueContainer>
      </div>

      <InfoLine
        title={'Distribution Type'}
        value={distributionType
          ? <ValueContainer colorScheme={'emeralds'} size={'sm'}>
              <Flex gap={'0.5rem'} alignItems={'center'}>
                {distributionType}
                <InfoIcon width={'1rem'} height={'1rem'} color={'#58F4BC'}/>
              </Flex>
            </ValueContainer>
          : <ValueContainer className={'TokenTotalCard__ZeroListBadge'}>none</ValueContainer>
        }
        loading={loading}
        error={error}
      />

      <InfoLine
        className={'TokenDigestCard__InfoLine'}
        title={'Token Creator'}
        value={(
          <ValueCard link={`identity/${owner}`} className={'TokenDigestCard__ValueContainer'} clickable={false}>
            <Identifier avatar={true} copyButton={true} styles={['highlight-both']} ellipsis={false}>
              {owner}
            </Identifier>
          </ValueCard>
        )}
        loading={token?.loading}
        error={token?.error || (!token?.loading && !owner)}
      />

      <InfoLine
        className={'TokenDigestCard__InfoLine'}
        title={'Total Gas Spent'}
        value={<CreditsBlock credits={totalGasUsed} rate={rate}/>}
        loading={token?.loading}
        error={token?.error || (!token?.loading && totalGasUsed == null)}
      />

      <InfoLine
        className={'TokenDigestCard__InfoLine'}
        title={'Mintable'}
        value={<Badge colorScheme={mintable ? 'green' : 'red'}>{mintable ? 'Yes' : 'No'}</Badge>}
        loading={token?.loading}
        error={token?.error || (!token?.loading && totalGasUsed == null)}
      />

      <InfoLine
        className={'TokenDigestCard__InfoLine'}
        title={'Change max supply'}
        value={<Badge colorScheme={changeMaxSupply ? 'green' : 'red'}>{changeMaxSupply ? 'Yes' : 'No'}</Badge>}
        loading={token?.loading}
        error={token?.error || (!token?.loading && changeMaxSupply == null)}
      />

      <InfoLine
        className={'TokenDigestCard__InfoLine'}
        title={'Burnable'}
        value={<Badge colorScheme={burnable ? 'green' : 'red'}>{burnable ? 'Yes' : 'No'}</Badge>}
        loading={token?.loading}
        error={token?.error || (!token?.loading && burnable == null)}
      />

      <InfoLine
        className={'TokenDigestCard__InfoLine'}
        title={'Freezable'}
        value={<Badge colorScheme={freezable ? 'green' : 'red'}>{freezable ? 'Yes' : 'No'}</Badge>}
        loading={token?.loading}
        error={token?.error || (!token?.loading && freezable == null)}
      />

      <InfoLine
        className={'TokenDigestCard__InfoLine'}
        title={'Unfreezable'}
        value={<Badge colorScheme={unfreezable ? 'green' : 'red'}>{unfreezable ? 'Yes' : 'No'}</Badge>}
        loading={token?.loading}
        error={token?.error || (!token?.loading && unfreezable == null)}
      />

      <InfoLine
        className={'TokenDigestCard__InfoLine'}
        title={'Destroyable'}
        value={<Badge colorScheme={destroyable ? 'green' : 'red'}>{destroyable ? 'Yes' : 'No'}</Badge>}
        loading={token?.loading}
        error={token?.error || (!token?.loading && destroyable == null)}
      />

      <InfoLine
        className={'TokenDigestCard__InfoLine'}
        title={'Allowed Emergency Actions'}
        value={<Badge colorScheme={allowedEmergencyActions ? 'green' : 'red'}>{allowedEmergencyActions ? 'Yes' : 'No'}</Badge>}
        loading={token?.loading}
        error={token?.error || (!token?.loading && allowedEmergencyActions == null)}
      />
    </div>
  )
}

export default TokenDigestCard
