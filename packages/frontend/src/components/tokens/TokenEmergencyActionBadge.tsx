import type { ReactNode } from 'react'
import { CirclePauseIcon, CirclePlayIcon } from '../ui/icons'
import { ValueContainer } from '../ui/containers'
import './TokenEmergencyActionBadge.css'

interface TokenEmergencyActionBadgeProps {
  type?: string | null
  size?: 'default' | 'xl' | 'lg' | 'md' | 'sm' | 'xs' | 'xxs'
  className?: string
  children?: ReactNode
  [key: string]: unknown
}

const TokenEmergencyActionBadge = ({ type, size = 'sm', ...props }: TokenEmergencyActionBadgeProps) => {
  const colorScheme: Record<string, 'red' | 'green' | 'gray'> = {
    pause: 'red',
    resume: 'green',
    default: 'gray'
  }

  const icons: Record<string, ReactNode> = {
    pause: <CirclePauseIcon w={6} h={6}/>,
    resume: <CirclePlayIcon w={6} h={6}/>
  }

  const key = String(type).toLowerCase()

  return (
    <ValueContainer
      className={'TokenEmergencyActionBadge'}
      size={size}
      colorScheme={colorScheme[key] ?? colorScheme.default}
      {...props}
    >
      <div className={'TokenEmergencyActionBadge__Content'}>
        {icons[key]}
        {type}
      </div>
    </ValueContainer>
  )
}

export default TokenEmergencyActionBadge
