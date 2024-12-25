import DocumentsListItem from './DocumentsListItem'
import { EmptyListMessage } from '../ui/lists'
// import Pagination from '../pagination'
// import { LoadingList } from '../loading'
// import { ErrorMessageBlock } from '../Errors'
import './DocumentsList.scss'
import { Grid, GridItem } from '@chakra-ui/react'
// import Link from 'next/link'

export default function DocumentsList ({ documents = [], headerStyles, variant, size = 'l' }) {
  const headerExtraClass = {
    default: '',
    light: 'DocumentsList__ColumnTitles--Light'
  }

  return (
    <div className={'DocumentsList'}>
      <Grid className={`DocumentsList__ColumnTitles ${headerExtraClass?.[headerStyles] || ''}`}>
        <GridItem className={'DocumentsList__ColumnTitle DocumentsList__ColumnTitle--Timestamp'}>
          Time
        </GridItem>
        <GridItem className={'DocumentsList__ColumnTitle DocumentsList__ColumnTitle--Identifier'}>
          Identifier
        </GridItem>
        <GridItem className={'DocumentsList__ColumnTitle DocumentsList__ColumnTitle--Owner'}>
          Owner
        </GridItem>
      </Grid>

      {documents?.length > 0
        ? documents?.map((document, key) => (
          <DocumentsListItem
            key={key}
            document={document}
          />
        ))
        : <EmptyListMessage>There are no documents yet.</EmptyListMessage>
      }
    </div>
  )

  // return (
  //   <div className={'DocumentsList ' + 'DocumentsList--Size' + size.toUpperCase()}>
  //       {documents.map((document, key) =>
  //           <DocumentsListItem
  //               key={key}
  //               size={size}
  //               document={document}
  //           />
  //       )}
  //
  //       {documents.length === 0 &&
  //           <EmptyListMessage>There are no documents created yet.</EmptyListMessage>
  //       }
  //   </div>
  // )
}
