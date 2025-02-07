import { Grid, GridItem } from '@chakra-ui/react'
import { Alias, Identifier, TimeDelta } from '../data'
import { LinkContainer } from '../ui/containers'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { findActiveAlias } from '../../util'
import './DocumentsListItem.scss'

function DocumentsListItem ({ document }) {
  const activeAlias = findActiveAlias(document?.owner?.aliases)
  const router = useRouter()

  return (
    <Link href={`/document/${document?.identifier}`} className={'DocumentsListItem'}>
      <Grid className={'DocumentsListItem__Content'}>
        <GridItem className={'DocumentsListItem__Column DocumentsListItem__Column--Timestamp'}>
          <TimeDelta endDate={new Date(document?.timestamp)}/>
        </GridItem>

        <GridItem className={'DocumentsListItem__Column DocumentsListItem__Column--Identifier'}>
          {document?.identifier
            ? <Identifier ellipsis={true} styles={['highlight-both']}>{document?.identifier}</Identifier>
            : <span className={'DocumentsListItem__NotActiveText'}>-</span>
          }
        </GridItem>

        <GridItem className={'DocumentsListItem__Column DocumentsListItem__Column--Owner'}>
          {document?.owner
            ? activeAlias
              ? <Alias avatarSource={document?.owner?.identifier || null}>{activeAlias.alias}</Alias>
              : <LinkContainer
                  className={'DocumentsListItem__ColumnContent'}
                  onClick={e => {
                    e.stopPropagation()
                    e.preventDefault()
                    router.push(`/identity/${document?.owner}`)
                  }}
                >
                  <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>{document?.owner}</Identifier>
                </LinkContainer>
            : <span className={'DocumentsListItem__NotActiveText'}>-</span>
          }
        </GridItem>
      </Grid>
    </Link>
  )
}

export default DocumentsListItem
