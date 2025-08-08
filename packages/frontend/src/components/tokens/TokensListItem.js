import Link from 'next/link'
import { Alias, Identifier, BigNumber, NotActive } from '../data'
import { Grid, GridItem } from '@chakra-ui/react'
import { Supply } from './index'
import { LinkContainer, ValueContainer } from '../ui/containers'
import { useRouter } from 'next/navigation'
import { currencyRound, findActiveAlias } from '../../util'
import './TokensListItem.scss'

function TokensListItem ({ token, variant = 'default' }) {
  const {
    identifier,
    dataContractIdentifier,
    maxSupply,
    totalSupply,
    owner,
    localizations,
    balance
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
              />
            : <BigNumber>{totalSupply}</BigNumber>
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
            {typeof balance === 'number'
              ? <ValueContainer colorScheme={'emeralds'} size='sm'>
                  {balance > 999999999
                    ? currencyRound(balance)
                    : <BigNumber>{balance}</BigNumber>
                  }
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
