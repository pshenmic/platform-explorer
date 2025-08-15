import './TickerBadge.scss'
import { ValueContainer } from '../ui/containers'

function TickerBadge ({ children, className, size = 'sm', ...props }) {
  return (
    <ValueContainer size={size} className={`TickerBadge ${className || ''}`} {...props}>
      {children}
    </ValueContainer>
  )
}

export default TickerBadge
