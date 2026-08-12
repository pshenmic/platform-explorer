import type { WithChildren, WithClassName } from '../../types/common'
import './NotActive.scss'

function NotActive ({ children, className }: WithChildren & WithClassName) {
  return (
    <span className={`NotActive ${className || ''}`}>{children || 'n/a'}</span>
  )
}

export default NotActive
