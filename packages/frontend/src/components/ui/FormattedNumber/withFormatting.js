import { forwardRef } from 'react'
import {
  concatDecimal,
  sliceNumberByDecimals,
  splitNum,
  trimEndZeros
} from '../../../util/numbers'
import { Tooltip } from '../Tooltips'
import { currencyRound } from '../../../util'

import styles from './FormattedNumber.module.scss'

export const withFormatting = (Component) => {
  const FormattedNumberWithTooltip = forwardRef(
    ({ children, decimals, threshold = 999999999, ...props }, ref) => {
      const value = String(children)
      const { integer, fractional } = sliceNumberByDecimals(value, decimals)

      const trimedFractional = trimEndZeros(fractional)

      const Child = ({ children: content }) => (
        <Tooltip
          placement={'top'}
          content={value}
        >
          <span>
            <Component
              {...props}
              ref={ref}
            >
              {content}
            </Component>
          </span>
        </Tooltip>
      )

      if (!integer) {
        return <Child>0,{trimedFractional}</Child>
      }

      if (threshold <= integer) {
        return (
          <Child>
            {concatDecimal(currencyRound(integer), trimedFractional)}
          </Child>
        )
      }

      if (integer > 0) {
        return (
          <Child>
            {splitNum(integer).map((num, i) => (
              <span className={styles.item} key={`${num}-${i}`}>{num}</span>
            ))}
          </Child>
        )
      }

      return (
        <Child>
          {splitNum(integer).map((num, i) => (
            <span className={styles.item} key={`${num}-${i}`}>{num}</span>
          ))}
          ,{trimedFractional}
        </Child>
      )
    }
  )

  FormattedNumberWithTooltip.displayName = 'FormattedNumberWithTooltip'

  return FormattedNumberWithTooltip
}
