import './BigNumber.scss'
import { formatNumberWithSpaces } from '../../util/numbers'

function BigNumber ({ children, className, decimalPlaces }) {
  if (children === undefined || children === null) return null

  const formatted = formatNumberWithSpaces(children, decimalPlaces)

  return (
        <span className={`BigNumber ${className || ''}`}>
          <span className={'BigNumber__Group'}>{formatted}</span>
        </span>
  )
}

export default BigNumber
