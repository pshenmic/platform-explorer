import { Grid, GridItem } from '@chakra-ui/react'
import { NotActive, BigNumber, CreditsBlock } from '../../data'
import { Tooltip } from '../../ui/Tooltips'
import './PriceListItem.scss'

function PriceListItem ({ priceData, rate, className }) {
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
            ? <Tooltip
                placement={'top'}
                maxW={'none'}
                content={<CreditsBlock credits={price} rate={rate}/>}
              >
                <div>
                  <BigNumber>{price}</BigNumber>
                </div>
              </Tooltip>
            : <NotActive/>
          }
        </GridItem>
      </Grid>
    </div>
  )
}

export default PriceListItem
