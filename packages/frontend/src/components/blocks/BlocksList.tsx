import type { Block } from '../../types'
import BlocksListItem from './BlocksListItem'
import { EmptyListMessage } from '../ui/lists'
import { Grid, GridItem } from '@chakra-ui/react'
import './BlocksList.scss'

const headerExtraClass: Record<string, string> = {
  default: '',
  light: 'BlocksList__ColumnTitles--Light'
}

interface BlocksListProps {
  blocks?: Array<Partial<Block>>
  size?: string
  headerStyles?: string
  absoluteDate?: boolean
}

function BlocksList ({
  blocks = [],
  size = 'l',
  headerStyles = 'default',
  absoluteDate
}: BlocksListProps) {
  return (
    <div className={`BlocksList ${absoluteDate ? 'BlocksList--TimestampAbsolute' : ''}`}>
      <Grid className={`BlocksList__ColumnTitles ${headerExtraClass[headerStyles] || ''}`}>
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

        <GridItem className={'BlocksList__ColumnTitle BlocksList__ColumnTitle--Timestamp'}>
          Timestamp
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
