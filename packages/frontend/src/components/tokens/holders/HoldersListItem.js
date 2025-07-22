import { Grid, GridItem } from '@chakra-ui/react'
import { Alias, BigNumber, Identifier, NotActive, TimeDelta } from '../../data'
import { LinkContainer } from '../../ui/containers'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { findActiveAlias } from '../../../util'
import './HoldersListItem.scss'

function HoldersListItem ({ holder }) {
  const activeAlias = findActiveAlias(holder?.aliases)
  const router = useRouter()

  return (
    <Link href={`/identity/${holder?.identifier}`} className={'HoldersListItem'}>
      <Grid className={'HoldersListItem__Content'}>
        <GridItem className={'HoldersListItem__Column HoldersListItem__Column--Holder'}>
          {holder?.identifier
            ? <LinkContainer
                className={'HoldersListItem__ColumnContent'}
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  router.push(`/identity/${holder?.identifier}`)
                }}
              >
                {activeAlias
                  ? <Alias avatarSource={holder?.identifier || null}>{activeAlias?.alias}</Alias>
                  : <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>{holder?.identifier}</Identifier>
                }
              </LinkContainer>
            : <NotActive/>
          }
        </GridItem>

        <GridItem className={'HoldersListItem__Column HoldersListItem__Column--TokensAmount HoldersListItem__Column--Number'}>
          <div className={'HoldersListItem__ColumnContent'}>
            <BigNumber>{holder.tokensAmount}</BigNumber>
          </div>
        </GridItem>

        <GridItem className={'HoldersListItem__Column HoldersListItem__Column--DashAmount HoldersListItem__Column--Number'}>
          <div className={'HoldersListItem__ColumnContent'}>
            <BigNumber>{holder.dashAmount}</BigNumber>
          </div>
        </GridItem>

        <GridItem className={'HoldersListItem__Column HoldersListItem__Column--LastActivity HoldersListItem__Column--Timestamp'}>
          <TimeDelta endDate={holder?.lastActivity}/>
        </GridItem>
      </Grid>
    </Link>
  )
}

export default HoldersListItem
