import Link from 'next/link'
import { Alias, Identifier, BigNumber } from '../data'
import { Grid, GridItem } from '@chakra-ui/react'
import { Supply } from './index'
import { LinkContainer } from '../ui/containers'
import { useRouter } from 'next/navigation'
import './TokensListItem.scss'

function TokensListItem ({ token }) {
  const {
    identifier,
    dataContractIdentifier,
    maxSupply,
    totalSupply,
    owner,
    localizations
  } = token
  const router = useRouter()

  const name = localizations?.en?.singularForm ||
    Object.values(localizations || {})[0]?.singularForm ||
    ''

  return (
    <Link href={`/token/${identifier}`} className={'TokensListItem'}>
      <Grid className={'TokensListItem__Content'}>
        <GridItem className={'TokensListItem__Column TokensListItem__Column--TokenName'}>
          <Alias avatarSource={identifier}>{name}</Alias>
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
              router.push(`/identity/${owner}`)
            }}
          >
            <Identifier
              className={'TokensListItem__OwnerIdentifier'}
              ellipsis={true}
              styles={['highlight-both']}
              avatar={true}
            >
              {owner}
            </Identifier>
          </LinkContainer>
        </GridItem>
      </Grid>
    </Link>
  )
}

export default TokensListItem
