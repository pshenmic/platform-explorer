import './BigNumber.scss'
import { formatNumberWithSpaces } from '../../util/numbers'

function BigNumber ({ children, className }) {
  if (children === undefined || children === null) return null

  const formatted = formatNumberWithSpaces(children)

  return (
        <span className={`BigNumber ${className || ''}`}>
          <span className={'BigNumber__Group'}>{formatted}</span>
        </span>
  )
}

export default BigNumber
