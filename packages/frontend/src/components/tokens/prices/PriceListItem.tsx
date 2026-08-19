import type { ComponentType, ReactNode } from 'react'
import { Grid, GridItem } from '@chakra-ui/react'
// Untyped JS components — loose wrappers until data/* is migrated
import {
  NotActive as NotActiveJs,
  BigNumber as BigNumberJs,
  CreditsBlock as CreditsBlockJs
} from '../../data'
import { Tooltip } from '../../ui/Tooltips'
import type { Rate } from '../../../types'
import type { WithClassName } from '../../../types/common'
import './PriceListItem.css'

const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode; className?: string }>
const BigNumber = BigNumberJs as ComponentType<{ children?: ReactNode; className?: string }>
const CreditsBlock = CreditsBlockJs as ComponentType<{
  credits?: string | number | null
  rate?: Pick<Rate, 'usd'> | null
}>

export interface PriceData {
  amount?: string | number
  price?: string | number
}

interface PriceListItemProps extends WithClassName {
  priceData?: PriceData | null
  rate?: Pick<Rate, 'usd'> | null
}

function PriceListItem({ priceData, rate, className }: PriceListItemProps) {
  const { amount, price } = priceData || {}

  return (
    <div className={`PriceListItem ${className || ''}`}>
      <Grid className={'PriceListItem__Content'}>
        <GridItem
          className={
            'PriceListItem__Column PriceListItem__Column--Amount PriceListItem__Column--Number'
          }
        >
          {amount !== undefined ? <BigNumber>{amount}</BigNumber> : <NotActive>-</NotActive>}
        </GridItem>
        <GridItem
          className={
            'PriceListItem__Column PriceListItem__Column--Price PriceListItem__Column--Number'
          }
        >
          {price !== undefined ? (
            <Tooltip
              placement={'top'}
              maxW={'none'}
              content={<CreditsBlock credits={price} rate={rate} />}
            >
              <div>
                <BigNumber>{price}</BigNumber>
              </div>
            </Tooltip>
          ) : (
            <NotActive />
          )}
        </GridItem>
      </Grid>
    </div>
  )
}

export default PriceListItem
