import { BigNumber } from './'
import { currencyRound } from '../../util'
import { Tooltip } from '../ui/Tooltips'
import { forwardRef } from 'react'
import { formatNumberWithSpaces } from '../../util/numbers'

const withToolTip = (Component) => {
  const FormattedNumberWithTooltip = forwardRef(({ children, ...props }, ref) => {
    const triggerElement = (
      <Component {...props} ref={ref}>
        {children}
      </Component>
    )

    return (
      <Tooltip content={formatNumberWithSpaces(children)}>
        {triggerElement}
      </Tooltip>
    )
  })

  FormattedNumberWithTooltip.displayName = 'FormattedNumberWithTooltip'

  return FormattedNumberWithTooltip
}

const FormattedNumber = forwardRef(({ children, threshold = 999999999, className }, ref) => {
  if (children === undefined || children === null) return null

  const number = Number(children)

  if (isNaN(number)) {
    return <span ref={ref} className={className}>{children}</span>
  }

  return number > threshold
    ? <span ref={ref} className={className || ''}>{currencyRound(number)}</span>
    : <BigNumber ref={ref} className={className || ''}>{number}</BigNumber>
})

FormattedNumber.displayName = 'FormattedNumber'

export default withToolTip(FormattedNumber)
