import type { WithClassName } from '../../../types'
import './HorisontalSeparator.css'

export default function HorisontalSeparator({ className }: WithClassName) {
  return <div className={`HorisontalSeparator ${className || ''}`}></div>
}
