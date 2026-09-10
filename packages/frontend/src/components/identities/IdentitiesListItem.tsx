import type { ComponentType, ReactNode } from 'react'
import type { Identity, Document } from '../../types'
import type { LoadableState } from '../../types/common'
import Link from 'next/link'
import {
  Identifier as IdentifierJs,
  Alias as AliasJs,
  DateBlock as DateBlockJs,
  BigNumber as BigNumberJs,
  NotActive as NotActiveJs
} from '../data'
import { Grid, GridItem } from '@chakra-ui/react'
import { FirstPlaceIcon, SecondPlaceIcon, ThirdPlaceIcon } from '../ui/icons'
import './IdentitiesListItem.css'

// Untyped JS modules — cast until migrated
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatar?: boolean
  ellipsis?: boolean
  middleEllipsis?: boolean
  copyButton?: boolean
  styles?: string[]
  clickable?: boolean
  alias?: string
}>
const Alias = AliasJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatarSource?: string | null
  alias?: string
  ellipsis?: boolean
}>
const DateBlock = DateBlockJs as ComponentType<{
  timestamp?: string | number | null
  format?: string
  showTime?: boolean
  showRelativeTooltip?: boolean
}>
const BigNumber = BigNumberJs as ComponentType<{ children?: ReactNode; className?: string }>
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode }>

const renderCount = (value: unknown) =>
  value != null && Number.isFinite(Number(value)) ? (
    <BigNumber>{String(value)}</BigNumber>
  ) : (
    <NotActive>—</NotActive>
  )

const placeIcons = {
  1: FirstPlaceIcon,
  2: SecondPlaceIcon,
  3: ThirdPlaceIcon
}

interface IdentitiesListItemProps {
  identity: Identity
  place?: number
}

function IdentitiesListItem({ identity, place }: IdentitiesListItemProps) {
  const PlaceIcon = placeIcons[place as 1 | 2 | 3]
  const {
    aliases,
    identifier,
    timestamp,
    isSystem,
    balance,
    totalTxs,
    totalDocuments,
    totalDataContracts
  } = identity
  const activeAlias = aliases?.find((alias: { status?: string }) => alias?.status === 'ok')

  const rootClassName = ['IdentitiesListItem', place ? `IdentitiesListItem--Rank${place}` : '']
    .filter(Boolean)
    .join(' ')

  return (
    <Link href={`/identity/${identifier}`} className={rootClassName}>
      <Grid className={'IdentitiesListItem__Content'}>
        <GridItem className={'IdentitiesListItem__Column IdentitiesListItem__Column--Identifier'}>
          <div className={'IdentitiesListItem__IdentifierContainer'}>
            {PlaceIcon && <PlaceIcon className={'IdentitiesListItem__Medal'} />}
            {activeAlias ? (
              <Alias
                className={'IdentitiesListItem__Alias'}
                alias={activeAlias?.alias}
                avatarSource={identifier}
              />
            ) : (
              <Identifier
                className={'IdentitiesListItem__Identifier'}
                middleEllipsis={true}
                avatar={true}
                copyButton={true}
              >
                {identifier}
              </Identifier>
            )}
          </div>
        </GridItem>

        <GridItem className={'IdentitiesListItem__Column IdentitiesListItem__Column--Balance'}>
          {balance != null ? <BigNumber>{String(balance)}</BigNumber> : <NotActive>—</NotActive>}
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

          {typeof timestamp === 'string' && (
            <div className={'IdentitiesListItem__Timestamp'}>
              <DateBlock
                format={'dateOnly'}
                showTime={true}
                timestamp={timestamp}
                showRelativeTooltip={true}
              />
            </div>
          )}
        </GridItem>
      </Grid>
    </Link>
  )
}

export default IdentitiesListItem
