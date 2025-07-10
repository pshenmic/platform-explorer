import Link from 'next/link'
import { Alias, Identifier } from '../data'
import { Grid, GridItem } from '@chakra-ui/react'
import { Supply, TickerBadge } from './index'
import { LinkContainer } from '../ui/containers'
import { useRouter } from 'next/navigation'
import './TokensListItem.scss'

function TokensListItem ({ token }) {
  const { name, ticker, tokenId, dataContract, currentSupply, maxSupply, ownerIdentity } = token
  const router = useRouter()

  return (
    <Link href={`/token/${tokenId}`} className={'TokensListItem'}>
      <Grid className={'TokensListItem__Content'}>
        <GridItem className={'TokensListItem__Column TokensListItem__Column--TokenName'}>
          <Alias>{name}</Alias>
        </GridItem>

        <GridItem className={'TokensListItem__Column TokensListItem__Column--Ticker'}>
          <TickerBadge>{ticker}</TickerBadge>
        </GridItem>

        <GridItem className={'TokensListItem__Column TokensListItem__Column--Supply'}>
          <Supply currentSupply={currentSupply} maxSupply={maxSupply}/>
        </GridItem>

        <GridItem className={'TokensListItem__Column TokensListItem__Column--DataContract'}>
          <LinkContainer
            className={'TokensListItem__DataContractLink'}
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/identity/${dataContract}`)
            }}
          >
            <Identifier
              className={'TokensListItem__Contract'}
              ellipsis={true}
              styles={['highlight-both']}
              avatar={true}
            >
              {dataContract}
            </Identifier>
          </LinkContainer>
        </GridItem>

        <GridItem className={'TokensListItem__Column TokensListItem__Column--OwnerIdentity'}>
          <LinkContainer
            className={'TokensListItem__OwnerLink'}
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/identity/${dataContract}`)
            }}
          >
            <Identifier
              className={'TokensListItem__OwnerIdentifier'}
              ellipsis={true}
              styles={['highlight-both']}
              avatar={true}
            >
              {ownerIdentity}
            </Identifier>
          </LinkContainer>
        </GridItem>
      </Grid>
    </Link>
  )
}

export default TokensListItem
