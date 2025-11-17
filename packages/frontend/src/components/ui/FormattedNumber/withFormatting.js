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

      const trimmedFractional = trimEndZeros(fractional)

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
        return <Child>0,{trimmedFractional}</Child>
      }

      if (threshold <= integer) {
        return (
          <Child>
            {concatDecimal(currencyRound(integer), trimmedFractional)}
          </Child>
        )
      }

      if (integer > 0) {
        return (
          <Child>
            {splitNum(integer).map((num, i) => (
              <span
                className={styles.item}
                key={`${num}-${i}`}
              >
                {num}
              </span>
            ))}
          </Child>
        )
      }

      if (trimmedFractional) {
        return (
          <Child>
            {splitNum(integer).map((num, i) => (
              <span
                className={styles.item}
                key={`${num}-${i}`}
              >
                {num}
              </span>
            ))}
            ,{trimmedFractional}
          </Child>
        )
      }

      return (
        <Child>
          {splitNum(integer).map((num, i) => (
            <span
              className={styles.item}
              key={`${num}-${i}`}
            >
              {num}
            </span>
          ))}
        </Child>
      )
    }
  )

  FormattedNumberWithTooltip.displayName = 'FormattedNumberWithTooltip'

  return FormattedNumberWithTooltip
}
