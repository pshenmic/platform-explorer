import PriceListItem from './PriceListItem'
import type { PriceData } from './PriceListItem'
import { EmptyListMessage } from '../../ui/lists'
import type { Rate } from '../../../types'
import type { WithClassName } from '../../../types/common'
import './PriceList.css'
import './PriceListItem.css'

interface PriceListProps extends WithClassName {
  prices?: PriceData[] | null
  rate?: Pick<Rate, 'usd'> | null
}

function PriceList({ prices = [], rate, className }: PriceListProps) {
  const list = prices || []

  return (
    <div className={`PriceList ${className || ''}`}>
      <div className={'PriceList__ColumnTitles'}>
        <div className={'PriceList__ColumnTitle PriceList__ColumnTitle--Amount'}>
          Amount
        </div>
        <div className={'PriceList__ColumnTitle PriceList__ColumnTitle--Price'}>
          Price (Credits)
        </div>
      </div>

      {list.length > 0 &&
        list.map((priceData, i) => <PriceListItem key={i} priceData={priceData} rate={rate} />)}

      {list.length === 0 && <EmptyListMessage>There are no prices</EmptyListMessage>}
    </div>
  )
}

export default PriceList
