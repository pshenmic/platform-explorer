import Link from 'next/link'
import { Identifier } from '../data'
import { Grid, GridItem } from '@chakra-ui/react'
import { Supply, TickerBadge } from './index'
import './TokensListItem.scss'

function TokensListItem ({ token }) {
  const { name, ticker, contract, currentSupply, maxSupply, ownerIdentity } = token

  return (
    <Link href={`/token/${contract}`} className={'TokensListItem'}>
      <Grid className={'TokensListItem__Content'}>
        <GridItem className={'TokensListItem__Column TokensListItem__Column--TokenName'}>
          {name}
        </GridItem>

        <GridItem className={'TokensListItem__Column TokensListItem__Column--Ticker'}>
          <TickerBadge>
            {ticker}
          </TickerBadge>
        </GridItem>

        <GridItem className={'TokensListItem__Column TokensListItem__Column--Supply'}>
          <Supply currentSupply={currentSupply} maxSupply={maxSupply}/>
        </GridItem>

        <GridItem className={'TokensListItem__Column TokensListItem__Column--Contract'}>
          <Identifier
            className={'TokensListItem__Contract'}
            ellipsis={true}
            styles={['highlight-both']}
            avatar={true}
          >
            {contract}
          </Identifier>
        </GridItem>

        <GridItem className={'TokensListItem__Column TokensListItem__Column--OwnerIdentity'}>
          <div className={'TokensListItem__OwnerContainer'}>
            <Identifier
              className={'TokensListItem__OwnerIdentifier'}
              ellipsis={true}
              styles={['highlight-both']}
              avatar={true}
            >
              {ownerIdentity}
            </Identifier>
          </div>
        </GridItem>
      </Grid>
    </Link>
  )
}

export default TokensListItem
