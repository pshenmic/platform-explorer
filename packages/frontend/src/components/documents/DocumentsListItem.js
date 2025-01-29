import { Grid, GridItem } from '@chakra-ui/react'
import { Identifier, NotActive, TimeDelta } from '../data'
import { LinkContainer } from '../ui/containers'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import './DocumentsListItem.scss'

function DocumentsListItem ({ document }) {
  const router = useRouter()

  return (
    <Link href={`/document/${document?.identifier}`} className={'DocumentsListItem'}>
      <Grid className={'DocumentsListItem__Content'}>
        <GridItem className={'DocumentsListItem__Column DocumentsListItem__Column--Timestamp'}>
          <TimeDelta endDate={document?.timestamp}/>
        </GridItem>

        <GridItem className={'DocumentsListItem__Column DocumentsListItem__Column--Identifier'}>
          {document?.identifier
            ? <Identifier ellipsis={true} styles={['highlight-both']}>{document?.identifier}</Identifier>
            : <NotActive/>
          }
        </GridItem>

        <GridItem className={'DocumentsListItem__Column DocumentsListItem__Column--Owner'}>
          {document?.owner
            ? <LinkContainer
                className={'DocumentsListItem__ColumnContent'}
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  router.push(`/identity/${document?.owner}`)
                }}
              >
                <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>{document?.owner}</Identifier>
              </LinkContainer>
            : <NotActive/>
          }
        </GridItem>
      </Grid>
    </Link>
  )
}

export default DocumentsListItem
