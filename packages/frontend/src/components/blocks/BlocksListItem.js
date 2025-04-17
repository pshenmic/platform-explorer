import Link from 'next/link'
import { Identifier, NotActive, TimeDelta, BigNumber, DateBlock } from '../data'
import { Badge, Grid, GridItem } from '@chakra-ui/react'
import { BlockIcon } from '../ui/icons'
import { LinkContainer } from '../ui/containers'
import { useRouter } from 'next/navigation'
import './BlocksListItem.scss'

function BlocksListItem ({ block, absoluteDate }) {
  const router = useRouter()
  const { header, txs } = block

  return (
    <Link href={`/block/${header?.hash}`} className={`BlocksListItem ${
        absoluteDate ? 'BlocksListItem--TimestampAbsolute' : ''
      }`}
    >
      <Grid className={'BlocksListItem__Content'}>
        <GridItem
          className={`BlocksListItem__Column BlocksListItem__Column--Timestamp ${
            absoluteDate ? 'BlocksListItem__Column--TimestampAbsolute' : ''
          }`}
        >
          {header?.timestamp
            ? absoluteDate
              ? <DateBlock
                  format={'dateOnly'}
                  showTime={true}
                  timestamp={header.timestamp}
                  showRelativeTooltip={true}
                />
              : <TimeDelta showTimestampTooltip={true} endDate={new Date(header.timestamp)}/>
            : <NotActive/>
          }
        </GridItem>

        <GridItem className={'BlocksListItem__Column BlocksListItem__Column--Height'}>
          <BlockIcon w={'1.125rem'} h={'1.125rem'} mr={'0.5rem'}/>
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
          <LinkContainer
            className={'BlocksListItem__LinkContainer'}
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/validator/${header?.validator}`)
            }}
          >
            <Identifier
              styles={['highlight-both']}
              linesAdjustment={false}
              avatar={true}
            >
              {header?.validator}
            </Identifier>
          </LinkContainer>
        </GridItem>

        <GridItem className={'BlocksListItem__Column BlocksListItem__Column--Number BlocksListItem__Column--Fees'}>
          {typeof header?.totalGasUsed === 'number' || typeof header?.totalGasUsed === 'string'
            ? <BigNumber>{header?.totalGasUsed}</BigNumber>
            : <NotActive>-</NotActive>
          }
        </GridItem>

        <GridItem className={'BlocksListItem__Column BlocksListItem__Column--Txs'}>
          {(typeof txs.length === 'number') &&
            <Badge>
              {txs.length}
            </Badge>
          }
        </GridItem>
      </Grid>
    </Link>
  )
}

export default BlocksListItem
