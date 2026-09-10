import type { ComponentType, ReactNode } from 'react'
import Link from 'next/link'
// Untyped JS components — loose wrappers until data/* is migrated
import {
  Alias as AliasJs,
  Identifier as IdentifierJs,
  NotActive as NotActiveJs,
  CreditsBlock as CreditsBlockJs
} from '../data'
import { Grid, GridItem, Flex } from '@chakra-ui/react'
import { Supply } from './index'
import { LinkContainer, ValueContainer } from '../ui/containers'
import { useRouter } from 'next/navigation'
import { findActiveAlias, getMinTokenPrice } from '../../util'
import { Tooltip } from '../ui/Tooltips'
import { FormattedNumber } from '../ui/FormattedNumber'
import type { Localization, Owner, Rate, Token } from '../../types'

import './TokensListItem.css'

const Alias = AliasJs as ComponentType<{
  children?: ReactNode
  alias?: string | null
  avatarSource?: string | null
  ellipsis?: boolean
  className?: string
}>
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  styles?: string[]
  ellipsis?: boolean
  className?: string
}>
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode, className?: string }>
const CreditsBlock = CreditsBlockJs as ComponentType<{
  credits?: string | number | null
  rate?: Pick<Rate, 'usd'> | null
}>

export type TokenPriceTier = { amount?: string | number, price: string | number }

/** List-row token shape (owner may be string or Owner; prices are tier arrays). */
export type TokenListItemData = Omit<Token, 'owner' | 'prices'> & {
  owner?: Owner | string | null
  prices?: TokenPriceTier[] | null
  balance?: string | number | null
  localizations?: Record<string, Partial<Localization>> | null
}

interface TokensListItemProps {
  token: TokenListItemData
  variant?: 'default' | 'balance'
  rate?: Pick<Rate, 'usd'> | null
}

function TokensListItem ({ token, variant = 'default', rate }: TokensListItemProps) {
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
  const ownerId = typeof owner === 'object' && owner ? owner.identifier : owner
  const ownerName = typeof owner === 'object' && owner ? findActiveAlias(owner.aliases) : null
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
          {maxSupply
            ? <Supply
                currentSupply={totalSupply}
                maxSupply={maxSupply || totalSupply}
                decimals={decimals}
              />
            : <FormattedNumber className={'TokensListItem__Column--SupplyBigNumber'} decimals={decimals ?? undefined}>{totalSupply}</FormattedNumber>
          }
        </GridItem>

        <GridItem className={'TokensListItem__Column TokensListItem__Column--Price TokensListItem__Column--Number'}>
          {token.price != null
            ? <Tooltip
              placement={'top'}
              maxW={'none'}
              content={<CreditsBlock credits={token.price} rate={rate} />}
            >
              <div>
                <ValueContainer colorScheme={'emeralds'} size={'sm'}>
                  <FormattedNumber decimals={decimals ?? undefined}>{token.price}</FormattedNumber>
                </ValueContainer>
              </div>
            </Tooltip>
            : token.prices != null && token.prices.length > 0
              ? <Tooltip
                placement={'top'}
                maxW={'none'}
                content={<CreditsBlock credits={getMinTokenPrice(token.prices)} rate={rate} />}
              >
                <Flex gap={'0.25rem'} fontSize={'0.75rem'} fontWeight={500}>
                  From <FormattedNumber decimals={decimals ?? undefined}>{getMinTokenPrice(token.prices)}</FormattedNumber>
                </Flex>
              </Tooltip>
              : <></>
          }
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
              ? <Alias avatarSource={ownerId} alias={ownerName?.alias} />
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
                <FormattedNumber decimals={decimals ?? undefined} threshold={0} >{balance}</FormattedNumber>
              </ValueContainer>
              : <NotActive />
            }
          </GridItem>
        )}
      </Grid>
    </Link>
  )
}

export default TokensListItem
