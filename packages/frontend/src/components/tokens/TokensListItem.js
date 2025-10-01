import Link from 'next/link'
import { Alias, Identifier, NotActive, CreditsBlock } from '../data'
import { Grid, GridItem, Flex } from '@chakra-ui/react'
import { Supply } from './index'
import { LinkContainer, ValueContainer } from '../ui/containers'
import { useRouter } from 'next/navigation'
import { findActiveAlias, getMinTokenPrice } from '../../util'
import { Tooltip } from '../ui/Tooltips'
import { FormattedNumber } from '../ui/FormattedNumber'

import './TokensListItem.scss'

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
          {maxSupply
            ? <Supply
                currentSupply={totalSupply}
                maxSupply={maxSupply || totalSupply}
                decimals={decimals}
              />
            : <FormattedNumber decimals={decimals}>{totalSupply}</FormattedNumber>
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
                  <FormattedNumber decimals={decimals}>{token.price}</FormattedNumber>
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
                  From <FormattedNumber decimals={decimals}>{getMinTokenPrice(token.prices)}</FormattedNumber>
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
                <FormattedNumber decimals={decimals} threshold={0} >{balance}</FormattedNumber>
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
