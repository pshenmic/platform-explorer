import type { ComponentType, ReactNode } from 'react'
import Link from 'next/link'
import {
  Alias as AliasJs,
  Identifier as IdentifierJs,
  BigNumber as BigNumberJs,
  NotActive as NotActiveJs,
  DateBlock as DateBlockJs
} from '../data'
import ValueContainer from '../ui/containers/ValueContainer'
import { Badge, Grid, GridItem } from '@chakra-ui/react'
import type { DataContract, Owner } from '../../types'
import './DataContractsListItem.scss'

// Untyped JS components — loose wrappers until data/* is migrated
const Alias = AliasJs as ComponentType<{
  children?: ReactNode
  avatarSource?: string | null
  className?: string
  ellipsis?: boolean
}>
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatar?: boolean
  copyButton?: boolean
  ellipsis?: boolean
  styles?: string[]
}>
const BigNumber = BigNumberJs as ComponentType<{ children?: ReactNode, className?: string }>
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode, className?: string }>
const DateBlock = DateBlockJs as ComponentType<{
  timestamp?: string | null
  format?: string
  showRelativeTooltip?: boolean
}>

type DataContractOwner = string | (Owner & { name?: string | null })

export interface DataContractsListItemData extends Partial<Omit<DataContract, 'owner'>> {
  owner?: DataContractOwner | null
  withTokens?: boolean
}

interface DataContractsListItemProps {
  dataContract: DataContractsListItemData
}

function DataContractsListItem ({ dataContract }: DataContractsListItemProps) {
  const ownerId = typeof dataContract?.owner === 'object' ? dataContract?.owner?.identifier : dataContract?.owner
  const ownerName = typeof dataContract?.owner === 'object' ? dataContract?.owner?.name || null : null

  return (
    <Link
      href={`/dataContract/${dataContract?.identifier}`}
      className={'DataContractsListItem'}
    >
      <Grid className={'DataContractsListItem__Content'}>
        <GridItem className={'DataContractsListItem__Column DataContractsListItem__Column--Identifier'}>
          <div className={'DataContractsListItem__IdentifierContainer'}>
            {dataContract?.name
              ? <Alias avatarSource={dataContract?.identifier}>{dataContract.name}</Alias>
              : <Identifier
                  className={'DataContractsListItem__Identifier'}
                  avatar={true}
                  styles={['highlight-both']}
                  ellipsis={true}
                >
                {dataContract.identifier}
              </Identifier>}
          </div>
        </GridItem>

        <GridItem className={'DataContractsListItem__Column DataContractsListItem__Column--Owner'}>
          {ownerName
            ? <Alias avatarSource={ownerId}>{ownerName}</Alias>
            : ownerId
              ? <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>{ownerId}</Identifier>
              : <span>-</span>
          }
        </GridItem>

        <GridItem className={'DataContractsListItem__Column DataContractsListItem__Column--System'}>
          {dataContract?.isSystem !== undefined
            ? <Badge colorScheme={dataContract?.isSystem ? 'orange' : 'gray'}>
              {dataContract?.isSystem ? 'true' : 'false'}
            </Badge>
            : <NotActive/>
          }
        </GridItem>

        <GridItem className={'DataContractsListItem__Column DataContractsListItem__Column--WithTokens'}>
          {isNaN(Number(dataContract?.tokensCount))
            ? <NotActive/>
            : <Badge colorScheme={(dataContract?.tokensCount ?? 0) > 0 ? 'orange' : 'gray'}>
              {(dataContract?.tokensCount ?? 0) > 0 ? 'true' : 'false'}
            </Badge>
          }
        </GridItem>

        <GridItem className={'DataContractsListItem__Column DataContractsListItem__Column--DocumentsCount'}>
          <ValueContainer colorScheme={(dataContract?.documentsCount ?? 0) > 0 ? 'brand' : 'darkGray'} size={'xs'}>
            <BigNumber>{dataContract?.documentsCount}</BigNumber>
          </ValueContainer>
        </GridItem>

        <GridItem className={'DataContractsListItem__Column DataContractsListItem__Column--Timestamp'}>
          {!dataContract?.timestamp && dataContract?.isSystem
            ? <span className={'DataContractsListItem__Genesis'}>Genesis</span>
            : <DateBlock timestamp={dataContract?.timestamp} format='dateOnly' />}
        </GridItem>
      </Grid>
    </Link>
  )
}

export default DataContractsListItem
