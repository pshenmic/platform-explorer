import { forwardRef } from 'react'
import type { ComponentType, ReactNode, Ref } from 'react'
import {
  concatDecimal,
  sliceNumberByDecimals,
  splitNum,
  trimEndZeros
} from '../../../util/numbers'
import { Tooltip } from '../Tooltips'
import { currencyRound } from '../../../util'

import styles from './FormattedNumber.module.scss'

interface FormattingProps {
  children?: ReactNode
  decimals?: number
  threshold?: number
  className?: string
}

export const withFormatting = (Component: ComponentType<Record<string, unknown>>) => {
  const FormattedNumberWithTooltip = forwardRef<HTMLElement, FormattingProps>(
    function FormattedNumberWithTooltip (props, ref) {
      const { children, decimals, threshold = 999999999, ...rest } = props
      const value = String(children)
      const { integer, fractional } = sliceNumberByDecimals(value, decimals ?? 0)

      const trimmedFractional = trimEndZeros(fractional)

      const Child = ({ children: content }: { children?: ReactNode }) => (
        <Tooltip
          placement={'top'}
          content={value}
        >
          <span>
            <Component
              {...(rest as Record<string, unknown>)}
              ref={ref as Ref<HTMLElement>}
            >
              {content}
            </Component>
          </span>
        </Tooltip>
      )

      if (!integer) {
        return <Child>0,{trimmedFractional}</Child>
      }

      if (threshold <= Number(integer)) {
        return (
          <Child>
            {concatDecimal(currencyRound(integer), trimmedFractional)}
          </Child>
        )
      }

      if (Number(integer) > 0) {
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
