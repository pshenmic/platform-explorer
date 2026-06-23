'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Alias, Identifier, BigNumber, NotActive, DateBlock } from '../data'
import ValueContainer from '../ui/containers/ValueContainer'
import { LinkContainer } from '../ui/containers'
import { Badge, Grid, GridItem } from '@chakra-ui/react'
import './DataContractsListItem.scss'

function DataContractsListItem ({ dataContract }) {
  const router = useRouter()
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
                  middleEllipsis={true}
                  copyButton={true}
                >
                {dataContract.identifier}
              </Identifier>}
          </div>
        </GridItem>

        <GridItem className={'DataContractsListItem__Column DataContractsListItem__Column--Owner'}>
          {ownerId
            ? <LinkContainer
                className={'DataContractsListItem__OwnerLink'}
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  router.push(`/identity/${ownerId}`)
                }}
              >
                {ownerName
                  ? <Alias avatarSource={ownerId}>{ownerName}</Alias>
                  : <Identifier avatar={true} middleEllipsis={true} copyButton={true}>{ownerId}</Identifier>}
              </LinkContainer>
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
          {isNaN(dataContract?.tokensCount)
            ? <NotActive/>
            : <Badge colorScheme={dataContract?.tokensCount > 0 ? 'orange' : 'gray'}>
              {dataContract?.tokensCount > 0 ? 'true' : 'false'}
            </Badge>
          }
        </GridItem>

        <GridItem className={'DataContractsListItem__Column DataContractsListItem__Column--DocumentsCount'}>
          <ValueContainer colorScheme={dataContract?.documentsCount > 0 ? 'brand' : 'darkGray'} size={'xs'}>
            <BigNumber>{dataContract?.documentsCount}</BigNumber>
          </ValueContainer>
        </GridItem>

        <GridItem className={'DataContractsListItem__Column DataContractsListItem__Column--Timestamp'}>
          <DateBlock timestamp={dataContract?.timestamp} format='dateOnly' showTime={true} showRelativeTooltip={true} />
        </GridItem>
      </Grid>
    </Link>
  )
}

export default DataContractsListItem
