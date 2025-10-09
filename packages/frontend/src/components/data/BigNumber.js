import './BigNumber.scss'
import { splitNum } from '../../util/numbers'

function BigNumber ({ children, className }) {
  if (children === undefined || children === null) return null

  const handleCopy = (e) => {
    e.preventDefault()
    e.clipboardData.setData('text/plain', children)
  }

  return (
    <span onCopy={handleCopy} className={`BigNumber ${className || ''}`}>
      <span className={'BigNumber__Group'}>
        {splitNum(children).map((num, i) => (
          <span className='BigNumber__Space' key={`${num}-${i}`}>{num}</span>
        ))}
      </span>
    </span>
  )
}

export default BigNumber
