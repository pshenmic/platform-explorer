import BlocksListItem from './BlocksListItem'
import { EmptyListMessage } from '../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import './BlocksList.scss'

function BlocksList ({ blocks = [], columnsCount = 1, size = 'l', headerStyles = 'default' }) {
  const headerExtraClass = {
    default: '',
    light: 'BlocksList__ColumnTitles--Light'
  }

  return (
    <div
      className={'BlocksList'}
      style={{
        columnCount: blocks.length > 1 ? columnsCount : 1
      }}
    >
      <Grid className={`BlocksList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
        <GridItem className={'BlocksList__ColumnTitle'}>
          Height
        </GridItem>
        <GridItem className={'BlocksList__ColumnTitle'}>
          Time
        </GridItem>
        <GridItem className={'BlocksList__ColumnTitle BlocksList__ColumnTitle--Hash'}>
          Block Hash
        </GridItem>
        <GridItem className={'BlocksList__ColumnTitle'}>
          TXs count
        </GridItem>
      </Grid>

      {blocks.map((block, i) =>
        <BlocksListItem
          key={i}
          block={block}
          size={size}
        />
      )}

      {blocks.length === 0 &&
        <EmptyListMessage>There are no blocks created yet.</EmptyListMessage>
      }
    </div>
  )
}

export default BlocksList
