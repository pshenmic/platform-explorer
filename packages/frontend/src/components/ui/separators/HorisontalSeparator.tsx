import type { WithClassName } from '../../../types'
import './HorisontalSeparator.scss'

export default function HorisontalSeparator ({ className }: WithClassName) {
  return <div className={`HorisontalSeparator ${className || ''}`}></div>
}
