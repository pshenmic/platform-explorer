import Link from 'next/link'
import { Identifier, NotActive, TimeDelta } from '../data'
import { Grid, GridItem } from '@chakra-ui/react'
import './BlocksListItem.scss'

// minmax(120px, 120px) // time
// minmax(0, 600px) // epoch
// minmax(0, 150px) // height
// minmax(0, 400px) // hash
// minmax(0, 400px) // proposed by
// minmax(0, 400px) // fees
// 150px; // tx count

function BlocksListItem ({ block }) {
  const { header, txs } = block

  return (
    <Link href={`/block/${header?.hash}`} className={'BlocksListItem'}>
      <Grid className={'BlocksListItem__Content'}>
        <GridItem className={'BlocksListItem__Column BlocksListItem__Column--Timestamp'}>
          {header?.timestamp
            ? <TimeDelta endDate={new Date(header.timestamp)}/>
            : <NotActive/>
          }
        </GridItem>

        <GridItem className={'BlocksListItem__Column BlocksListItem__Column--Epoch'}>
          {header?.epoch ?? null ?? <NotActive>-</NotActive>}
        </GridItem>

        <GridItem className={'BlocksListItem__Column BlocksListItem__Column--Height'}>
          {header?.height ?? <NotActive>-</NotActive>}
        </GridItem>

        <GridItem className={'BlocksListItem__Column BlocksListItem__Column--Hash'}>
          {typeof header?.hash === 'string' &&
            <Identifier className={'BlocksListItem__Hash'} styles={['highlight-both']}>
              {header?.hash}
            </Identifier>
          }
        </GridItem>

        <GridItem className={'BlocksListItem__Column BlocksListItem__Column--Validator'}>
          <Identifier
            styles={['highlight-both']}
            ellipsis={false}
            avatar={true}
          >
            {header?.validator}
          </Identifier>
        </GridItem>

        <GridItem className={'BlocksListItem__Column BlocksListItem__Column--Fees'}>
          {header?.totalGasUsed ?? <NotActive>-</NotActive>}
        </GridItem>

        <GridItem className={'BlocksListItem__Column BlocksListItem__Column--Txs'}>
          {(typeof txs.length === 'number') &&
            <span className={'BlocksListItem__Txs'}>({txs.length} txs)</span>
          }
        </GridItem>
      </Grid>
    </Link>
  )
}

export default BlocksListItem
