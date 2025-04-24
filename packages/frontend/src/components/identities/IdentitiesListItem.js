import Link from 'next/link'
import { Identifier, Alias, DateBlock } from '../data'
import { Grid, GridItem } from '@chakra-ui/react'
import './IdentitiesListItem.scss'

function IdentitiesListItem ({ identity }) {
  const { aliases, identifier, timestamp, isSystem } = identity
  const activeAlias = aliases?.find(alias => alias?.status === 'ok')

  return (
    <Link
      href={`/identity/${identifier}`}
      className={'IdentitiesListItem'}
    >
      <Grid className={'IdentitiesListItem__Content'}>
        <GridItem className={'IdentitiesListItem__Column IdentitiesListItem__Column--Identifier'}>

          <div className={'IdentitiesListItem__IdentifierContainer'}>
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
