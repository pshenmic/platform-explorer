import Link from 'next/link'
import { Identifier, Alias, DateBlock, BigNumber, NotActive } from '../data'
import { Grid, GridItem } from '@chakra-ui/react'
import { FirstPlaceIcon, SecondPlaceIcon, ThirdPlaceIcon } from '../ui/icons'
import './IdentitiesListItem.scss'

const renderCount = (value) =>
  value != null && Number.isFinite(Number(value))
    ? <BigNumber>{value}</BigNumber>
    : <NotActive>—</NotActive>

const placeIcons = {
  1: FirstPlaceIcon,
  2: SecondPlaceIcon,
  3: ThirdPlaceIcon
}

function IdentitiesListItem ({ identity, place }) {
  const PlaceIcon = placeIcons[place]
  const { aliases, identifier, timestamp, isSystem, balance, totalTxs, totalDocuments, totalDataContracts } = identity
  const activeAlias = aliases?.find(alias => alias?.status === 'ok')

  const rootClassName = [
    'IdentitiesListItem',
    place ? `IdentitiesListItem--Rank${place}` : ''
  ].filter(Boolean).join(' ')

  return (
    <Link
      href={`/identity/${identifier}`}
      className={rootClassName}
    >
      <Grid className={'IdentitiesListItem__Content'}>
        <GridItem className={'IdentitiesListItem__Column IdentitiesListItem__Column--Identifier'}>

          <div className={'IdentitiesListItem__IdentifierContainer'}>
            {PlaceIcon &&
              <PlaceIcon className={'IdentitiesListItem__Medal'}/>
            }
            {activeAlias
              ? <Alias
                  className={'IdentitiesListItem__Alias'}
                  alias={activeAlias?.alias}
                  avatarSource={identifier}
                />
              : <Identifier
                  className={'IdentitiesListItem__Identifier'}
                  ellipsis={true}
                  styles={['highlight-both']}
                  avatar={true}
                >
                  {identifier}
                </Identifier>
            }
          </div>
        </GridItem>

        <GridItem className={'IdentitiesListItem__Column IdentitiesListItem__Column--Balance'}>
          {balance != null ? <BigNumber>{balance}</BigNumber> : <NotActive>—</NotActive>}
        </GridItem>

        <GridItem className={'IdentitiesListItem__Column IdentitiesListItem__Column--Txs'}>
          {renderCount(totalTxs)}
        </GridItem>

        <GridItem className={'IdentitiesListItem__Column IdentitiesListItem__Column--Documents'}>
          {renderCount(totalDocuments)}
        </GridItem>

        <GridItem className={'IdentitiesListItem__Column IdentitiesListItem__Column--Contracts'}>
          {renderCount(totalDataContracts)}
        </GridItem>

        <GridItem className={'IdentitiesListItem__Column IdentitiesListItem__Column--Timestamp'}>
          {isSystem && <div>SYSTEM</div>}

          {typeof timestamp === 'string' &&
            <div className={'IdentitiesListItem__Timestamp'}>
              <DateBlock
                format={'dateOnly'}
                showTime={true}
                timestamp={timestamp}
                showRelativeTooltip={true}
              />
            </div>
          }
        </GridItem>
      </Grid>
    </Link>
  )
}

export default IdentitiesListItem
