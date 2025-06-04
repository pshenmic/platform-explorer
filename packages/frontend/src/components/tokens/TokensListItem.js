import Link from 'next/link'
import { Identifier } from '../data'
import { Grid, GridItem, Progress, Box, Flex } from '@chakra-ui/react'
import './TokensListItem.scss'

function TokensListItem ({ token }) {
  const { name, ticker, contract, currentSupply, maxSupply, ownerIdentity } = token

  return (
    <Link
      href={`/token/${contract}`}
      className={'TokensListItem'}
    >
      <Grid className={'TokensListItem__Content'}>
        <GridItem className={'TokensListItem__Column TokensListItem__Column--TokenName'}>
          {name}
        </GridItem>

        <GridItem className={'TokensListItem__Column TokensListItem__Column--Ticker'}>
          <Box className={'TokensListItem__TickerBadge'}>
            {ticker}
          </Box>
        </GridItem>

        <GridItem className={'TokensListItem__Column TokensListItem__Column--Supply'}>
          <div className={'TokensListItem__SupplyContainer'}>
            <Flex justifyContent={'space-between'} w={'100%'}>
              <span>{currentSupply}</span>
              <span>{maxSupply}</span>
            </Flex>
            <Progress
              value={(parseInt(currentSupply.replace(/\D/g, '')) / parseInt(maxSupply.replace(/\D/g, ''))) * 100}
              height={'1px'}
              width={'9rem'}
              colorScheme={'gray'}
            />
          </div>
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
