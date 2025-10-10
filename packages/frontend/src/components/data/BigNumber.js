import './BigNumber.scss'
import { splitNum } from '../../util/numbers'

function BigNumber ({ children, className }) {
  if (children === undefined || children === null) return null

  return (
    <span className={`BigNumber ${className || ''}`}>
      <span className={'BigNumber__Group'}>
        {splitNum(children).map((num, i) => (
          <span className='BigNumber__Space' key={`${num}-${i}`}>{num}</span>
        ))}
      </span>
    </span>
  )
}

export default BigNumber
