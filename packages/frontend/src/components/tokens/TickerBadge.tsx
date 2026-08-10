import type { ReactNode } from 'react'
import './TickerBadge.scss'
import { ValueContainer } from '../ui/containers'
import type { WithClassName } from '../../types/common'

interface TickerBadgeProps extends WithClassName {
  children?: ReactNode
  size?: 'default' | 'xl' | 'lg' | 'md' | 'sm' | 'xs' | 'xxs'
  [key: string]: unknown
}

function TickerBadge ({ children, className, size = 'sm', ...props }: TickerBadgeProps) {
  return (
    <ValueContainer size={size} className={`TickerBadge ${className || ''}`} {...props}>
      {children}
    </ValueContainer>
  )
}

export default TickerBadge
