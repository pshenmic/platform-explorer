import { Grid, GridItem } from '@chakra-ui/react'
import PriceListItem from './PriceListItem'
import { EmptyListMessage } from '../../ui/lists'
import './PriceList.scss'
import './PriceListItem.scss'

function PriceList ({ prices = [], rate, className }) {
  return (
    <div className={`PriceList ${className || ''}`}>
      <Grid className={'PriceList__ColumnTitles'}>
        <GridItem className={'PriceList__ColumnTitle PriceList__ColumnTitle--Amount'}>
          Amount
        </GridItem>
        <GridItem className={'PriceList__ColumnTitle PriceList__ColumnTitle--Price'}>
          Price (Credits)
        </GridItem>
      </Grid>

      {prices?.length > 0 &&
        prices.map((priceData, i) => (
          <PriceListItem
            key={i}
            priceData={priceData}
            rate={rate}
          />
        ))
      }

      {prices?.length === 0 &&
        <EmptyListMessage>There are no prices</EmptyListMessage>
      }
    </div>
  )
}

export default PriceList
