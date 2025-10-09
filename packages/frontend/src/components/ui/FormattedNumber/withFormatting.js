import { forwardRef } from 'react'
import {
  concatDecimal,
  formatNumberWithSpaces,
  sliceNumberByDecimals,
  trimEndZeros
} from '../../../util/numbers'
import { Tooltip } from '../Tooltips'
import { currencyRound } from '../../../util'

export const withFormatting = (Component) => {
  const FormattedNumberWithTooltip = forwardRef(
    ({ children, decimals, threshold = 999999999, ...props }, ref) => {
      const value = String(children)
      const { integer, fractional } = sliceNumberByDecimals(value, decimals)

      const trimedFractional = trimEndZeros(fractional)

      const Child = ({ children: content, tooltip }) => (
        <Tooltip placement={'top'} content={tooltip}>
          <span>
            <Component {...props} ref={ref}>
              {content}
            </Component>
          </span>
        </Tooltip>
      )

      if (!integer) {
        return (
          <Child tooltip={`0,${trimedFractional}`}>0,{trimedFractional}</Child>
        )
      }

      const formatedInteger = formatNumberWithSpaces(integer)
      const fullValue = concatDecimal(formatedInteger, trimedFractional)

      if (threshold > integer) {
        return <Child tooltip={fullValue}>{fullValue}</Child>
      }

      return (
        <Child tooltip={fullValue}>
          {concatDecimal(currencyRound(integer), trimedFractional)}
        </Child>
      )
    }
  )

  FormattedNumberWithTooltip.displayName = 'FormattedNumberWithTooltip'

  return FormattedNumberWithTooltip
}
