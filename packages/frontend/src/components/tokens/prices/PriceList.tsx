'use client'

export interface PriceData {
  amount?: string | number
  price?: string | number
}
import { DataList } from '../../ui/lists'
import { BigNumber, NotActive, CreditsBlock } from '../../data'
import { Tooltip } from '../../ui/Tooltips'
import type { Rate } from '../../../types'
import type { WithClassName } from '../../../types/common'
interface PriceListProps extends WithClassName {
  prices?: PriceData[] | null
  rate?: Pick<Rate, 'usd'> | null
}

export default function PriceList({ prices = [], rate, className }: PriceListProps) {
  return (
    <DataList
      items={prices || []}
      className={className}
      emptyMessage="There are no prices"
      columns={[
        {
          key: 'amount',
          header: 'Amount',
          minWidth: 120,
          grow: true,
          numeric: true,
          cell: item =>
            item.amount !== undefined ? <BigNumber>{item.amount}</BigNumber> : <NotActive />
        },
        {
          key: 'price',
          header: 'Price (Credits)',
          minWidth: 160,
          grow: true,
          numeric: true,
          cell: item =>
            item.price !== undefined ? (
              <Tooltip
                placement="top"
                maxW="none"
                content={<CreditsBlock credits={item.price} rate={{ data: rate }} />}
              >
                <span>
                  <BigNumber>{item.price}</BigNumber>
                </span>
              </Tooltip>
            ) : (
              <NotActive />
            )
        }
      ]}
    />
  )
}
