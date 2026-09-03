import type { ReactNode } from 'react'
import type { WithClassName } from '../../types/common'
import './BigNumber.css'
import { splitNum } from '../../util/numbers'

interface BigNumberProps extends WithClassName {
  children?: ReactNode
}

function BigNumber({ children, className }: BigNumberProps) {
  if (children === undefined || children === null) return null

  return (
    <span className={`BigNumber ${className || ''}`}>
      <span className={'BigNumber__Group'}>
        {splitNum(children as string | number).map((num, i) => (
          <span className="BigNumber__Space" key={`${num}-${i}`}>
            {num}
          </span>
        ))}
      </span>
    </span>
  )
}

export default BigNumber
