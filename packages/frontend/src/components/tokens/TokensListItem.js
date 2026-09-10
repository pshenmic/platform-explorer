import Link from 'next/link'
import { Alias, Identifier, NotActive, CreditsBlock } from '../data'
import { Grid, GridItem, Flex, Progress } from '@chakra-ui/react'
import { LinkContainer, ValueContainer } from '../ui/containers'
import { useRouter } from 'next/navigation'
import { findActiveAlias, getMinTokenPrice } from '../../util'
import { Tooltip } from '../ui/Tooltips'
import { FormattedNumber } from '../ui/FormattedNumber'

import './TokensListItem.scss'

/**
 * List-optimized supply: one primary figure (total/circulating).
 * Dual minted+max side-by-side is for detail cards — it crushes narrow list tracks.
 * If a cap exists and differs from total, show a thin progress bar + tooltip.
 */
function ListSupply ({ totalSupply, maxSupply, decimals }) {
  const hasMax = maxSupply != null && Number(maxSupply) > 0
  const total = totalSupply ?? 0
  const capped = hasMax && Number(maxSupply) !== Number(total)
  const pct = capped ? Math.min(100, (Number(total) / Number(maxSupply)) * 100) : 0

  const value = (
    <div className={'TokensListItem__Supply'}>
      <FormattedNumber className={'TokensListItem__SupplyValue'} decimals={decimals}>
        {total}
      </FormattedNumber>
      {capped && (
        <Progress
          className={'TokensListItem__SupplyBar'}
          value={pct}
          height={'2px'}
          width={'100%'}
          colorScheme={'gray'}
          aria-hidden={'true'}
        />
      )}
    </div>
  )

  if (!capped) return value

  return (
    <Tooltip
      placement={'top'}
      content={
        <span>
          Minted{' '}
          <FormattedNumber decimals={decimals}>{total}</FormattedNumber>
          {' / max '}
          <FormattedNumber decimals={decimals}>{maxSupply}</FormattedNumber>
        </span>
      }
    >
      {value}
    </Tooltip>
  )
}

function ListPrice ({ token, rate, decimals }) {
  if (token.price != null) {
    return (
      <Tooltip
        placement={'top'}
        maxW={'none'}
        content={<CreditsBlock credits={token.price} rate={rate}/>}
      >
        <div>
          <ValueContainer colorScheme={'emeralds'} size={'sm'}>
            <FormattedNumber decimals={decimals}>{token.price}</FormattedNumber>
          </ValueContainer>
        </div>
      </Tooltip>
    )
  }

  if (token.prices != null && token.prices.length > 0) {
    const min = getMinTokenPrice(token.prices)
    return (
      <Tooltip
        placement={'top'}
        maxW={'none'}
        content={<CreditsBlock credits={min} rate={rate}/>}
      >
        <Flex gap={'0.25rem'} fontSize={'0.75rem'} fontWeight={500} className={'TokensListItem__PriceFrom'}>
          From <FormattedNumber decimals={decimals}>{min}</FormattedNumber>
        </Flex>
      </Tooltip>
    )
  }

  // API currently returns price/prices null for most tokens — quiet empty, not “error”
  return <NotActive className={'TokensListItem__PriceEmpty'}>—</NotActive>
}

function TokensListItem ({ token, variant = 'default', rate }) {
  const {
    identifier,
    dataContractIdentifier,
    maxSupply,
    totalSupply,
    owner,
    localizations,
    balance,
    decimals
  } = token
  const router = useRouter()
  const ownerId = typeof owner === 'object' ? owner?.identifier : owner
  const ownerName = typeof owner === 'object' ? findActiveAlias(owner?.aliases) : null
  const name = localizations?.en?.singularForm ||
    Object.values(localizations || {})[0]?.singularForm ||
    ''

  const variantClass = variant === 'balance' ? 'TokensListItem--Balance' : ''

  return (
    <Link href={`/token/${identifier}`} className={`TokensListItem ${variantClass}`}>
      <Grid className={'TokensListItem__Content'}>
        <GridItem className={'TokensListItem__Column TokensListItem__Column--TokenName'}>
          {name
            ? <Alias avatarSource={identifier}>{name}</Alias>
            : <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>{identifier}</Identifier>
          }
        </GridItem>

        <GridItem className={'TokensListItem__Column TokensListItem__Column--Supply'}>
          <ListSupply
            totalSupply={totalSupply}
            maxSupply={maxSupply}
            decimals={decimals}
          />
        </GridItem>

        <GridItem className={'TokensListItem__Column TokensListItem__Column--Price TokensListItem__Column--Number'}>
          <ListPrice token={token} rate={rate} decimals={decimals}/>
        </GridItem>

        <GridItem className={'TokensListItem__Column TokensListItem__Column--DataContract'}>
          <LinkContainer
            className={'TokensListItem__DataContractLink'}
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/dataContract/${dataContractIdentifier}`)
            }}
          >
            <Identifier
              className={'TokensListItem__Contract'}
              ellipsis={true}
              styles={['highlight-both']}
              avatar={true}
            >
              {dataContractIdentifier}
            </Identifier>
          </LinkContainer>
        </GridItem>

        <GridItem className={'TokensListItem__Column TokensListItem__Column--OwnerIdentity'}>
          <LinkContainer
            className={'TokensListItem__OwnerLink'}
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/identity/${ownerId}`)
            }}
          >
            {ownerName
              ? <Alias avatarSource={ownerId} alias={ownerName?.alias}/>
              : <Identifier
                  className={'TokensListItem__OwnerIdentifier'}
                  ellipsis={true}
                  avatar={true}
                  styles={['highlight-both']}
                >
                  {ownerId}
                </Identifier>
            }
          </LinkContainer>
        </GridItem>

        {variant === 'balance' && (
          <GridItem className={'TokensListItem__Column TokensListItem__Column--Balance TokensListItem__Column--Number'}>
            {typeof balance === 'number' || typeof balance === 'string'
              ? <ValueContainer colorScheme={'emeralds'} size={'sm'}>
                  <FormattedNumber decimals={decimals} threshold={0}>{balance}</FormattedNumber>
                </ValueContainer>
              : <NotActive/>
            }
          </GridItem>
        )}
      </Grid>
    </Link>
  )
}

export default TokensListItem
