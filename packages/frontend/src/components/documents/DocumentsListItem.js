import { Grid, GridItem } from '@chakra-ui/react'
import { Identifier } from '../data'
import { LinkContainer } from '../ui/containers'
import Link from 'next/link'
import { getTimeDelta } from '../../util'
import './DocumentsListItem.scss'

function DocumentsListItem ({ document }) {
  return (
    <Link href={`/document/${document?.identifier}`} className={'DocumentsListItem'}>
      <Grid className={'DocumentsListItem__Content'}>
        <GridItem className={'DocumentsListItem__Column DocumentsListItem__Column--Timestamp'}>
          {getTimeDelta(new Date(), new Date(document?.timestamp))}
        </GridItem>

        <GridItem className={'DocumentsListItem__Column DocumentsListItem__Column--Identifier'}>
          {document?.identifier
            ? <Identifier ellipsis={true} styles={['highlight-both']}>{document?.identifier}</Identifier>
            : <span className={'DocumentsListItem__NotActiveText'}>-</span>
          }
        </GridItem>

        <GridItem className={'DocumentsListItem__Column DocumentsListItem__Column--Owner'}>
          {document?.owner
            ? <LinkContainer className={'DocumentsListItem__ColumnContent'} isLocal={true} href={'/identity/' + document?.owner}>
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

// export default function DocumentsListItem ({ document }) {
//   const { identifier, timestamp } = document
//
//   return (
//     <Link
//         href={`/document/${identifier}`}
//         className={'DocumentsListItem'}
//     >
//         <div className={'DocumentsListItem__Identifier'}>
//             {identifier}
//         </div>
//
//         <div className={'DocumentsListItem__Timestamp'}>
//             {new Date(timestamp).toLocaleString()}
//         </div>
//     </Link>
//   )
// }
