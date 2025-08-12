import { Grid, GridItem } from '@chakra-ui/react'
import { NotActive, BigNumber } from '../../data'
import './PriceListItem.scss'

function PriceListItem ({ priceData, className }) {
  const { amount, price } = priceData || {}

  return (
    <div className={`PriceListItem ${className || ''}`}>
      <Grid className={'PriceListItem__Content'}>
        <GridItem className={'PriceListItem__Column PriceListItem__Column--Amount PriceListItem__Column--Number'}>
          {amount !== undefined
            ? <BigNumber>{amount}</BigNumber>
            : <NotActive>-</NotActive>
          }
        </GridItem>
        <GridItem className={'PriceListItem__Column PriceListItem__Column--Price PriceListItem__Column--Number'}>
          {price !== undefined
            ? <BigNumber>{price}</BigNumber>
            : <NotActive/>
          }
        </GridItem>
      </Grid>
    </div>
  )
}

export default PriceListItem
