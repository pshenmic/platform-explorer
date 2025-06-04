import Link from 'next/link'
import { Identifier, Alias, DateBlock } from '../data'
import { Grid, GridItem } from '@chakra-ui/react'
import './TokensListItem.scss'

function TokensListItem ({ identity }) {
  const { aliases, identifier, timestamp, isSystem } = identity
  const activeAlias = aliases?.find(alias => alias?.status === 'ok')

  return (
    <Link
      href={`/identity/${identifier}`}
      className={'TokensListItem'}
    >
      <Grid className={'TokensListItem__Content'}>
        <GridItem className={'TokensListItem__Column TokensListItem__Column--Identifier'}>

          <div className={'TokensListItem__IdentifierContainer'}>
            {activeAlias
              ? <Alias
                className={'TokensListItem__Alias'}
                alias={activeAlias?.alias}
                avatarSource={identifier}
              />
              : <Identifier
                className={'TokensListItem__Identifier'}
                ellipsis={true}
                styles={['highlight-both']}
                avatar={true}
              >
                {identifier}
              </Identifier>
            }
          </div>
        </GridItem>

        <GridItem className={'TokensListItem__Column TokensListItem__Column--Timestamp'}>
          {isSystem && <div>SYSTEM</div>}

          {typeof timestamp === 'string' &&
            <div className={'TokensListItem__Timestamp'}>
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

export default TokensListItem
