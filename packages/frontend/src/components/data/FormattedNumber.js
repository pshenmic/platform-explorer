import { BigNumber } from './'
import { currencyRound } from '../../util'

const FormattedNumber = ({ children, threshold = 999999999, className }) => {
  if (children === undefined || children === null) return null

  const number = Number(children)

  if (isNaN(number)) {
    return <span className={className}>{children}</span>
  }

  return number > threshold
    ? <span className={className || ''}>{currencyRound(number)}</span>
    : <BigNumber className={className || ''}>{number}</BigNumber>
}

export default FormattedNumber
