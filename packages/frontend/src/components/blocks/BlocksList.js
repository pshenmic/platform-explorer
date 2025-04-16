import BlocksListItem from './BlocksListItem'
import { EmptyListMessage } from '../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import './BlocksList.scss'

function BlocksList ({ blocks = [], size = 'l', headerStyles = 'default', absoluteDate }) {
  const headerExtraClass = {
    default: '',
    light: 'BlocksList__ColumnTitles--Light'
  }

  return (
    <div className={`BlocksList ${absoluteDate ? 'BlocksList--TimestampAbsolute' : ''}`}>
      <Grid className={`BlocksList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
        <GridItem className={'BlocksList__ColumnTitle BlocksList__ColumnTitle--Timestamp'}>
          Time
        </GridItem>

        <GridItem className={'BlocksList__ColumnTitle BlocksList__ColumnTitle--Height'}>
          Height
        </GridItem>

        <GridItem className={'BlocksList__ColumnTitle BlocksList__ColumnTitle--Hash'}>
          Block Hash
        </GridItem>

        <GridItem className={'BlocksList__ColumnTitle BlocksList__ColumnTitle--Validator'}>
          Proposed By
        </GridItem>

        <GridItem className={'BlocksList__ColumnTitle BlocksList__ColumnTitle--Fees'}>
          Fees
        </GridItem>

        <GridItem className={'BlocksList__ColumnTitle BlocksList__ColumnTitle--Txs'}>
          TXs count
        </GridItem>
      </Grid>

      {blocks.map((block, i) =>
        <BlocksListItem
          key={i}
          block={block}
          size={size}
          absoluteDate={absoluteDate}
        />
      )}

      {blocks.length === 0 &&
        <EmptyListMessage>There are no blocks yet.</EmptyListMessage>
      }
    </div>
  )
}

export default BlocksList
