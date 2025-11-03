import Link from 'next/link'
import { Alias, Identifier, BigNumber } from '../data'
import ValueContainer from '../ui/containers/ValueContainer'
import { Grid, GridItem } from '@chakra-ui/react'
import './DataContractsListItem.scss'

function DataContractsListItem ({ dataContract }) {
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
          {dataContract?.isSystem ? <span className={'DataContractsListItem__Badge DataContractsListItem__Badge--System'}>Yes</span> : <span className={'DataContractsListItem__Badge'}>No</span>}
        </GridItem>

        <GridItem className={'DataContractsListItem__Column DataContractsListItem__Column--WithTokens'}>
          {dataContract?.withTokens ? <span className={'DataContractsListItem__Badge DataContractsListItem__Badge--WithTokens'}>Yes</span> : <span className={'DataContractsListItem__Badge'}>No</span>}
        </GridItem>

        <GridItem className={'DataContractsListItem__Column DataContractsListItem__Column--DocumentsCount'}>
          <ValueContainer colorScheme={dataContract?.documentsCount > 0 ? 'brand' : 'darkGray'} size={'xs'}>
            <BigNumber>{dataContract?.documentsCount}</BigNumber>
          </ValueContainer>
        </GridItem>

        <GridItem className={'DataContractsListItem__Column DataContractsListItem__Column--Timestamp'}>
          {(typeof dataContract?.timestamp === 'string')
            ? <div className={'DataContractsListItem__Timestamp'}>
                {new Date(dataContract?.timestamp).toLocaleString()}
              </div>
            : <span>-</span>
          }
        </GridItem>
      </Grid>
    </Link>
  )
}

export default DataContractsListItem
