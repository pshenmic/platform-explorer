import type { ComponentType, ReactNode } from 'react'
import { ValueContainer } from '../ui/containers'
import { ValueCard as ValueCardJs } from '../cards'
import type { WithClassName } from '../../types/common'
import './PublicKeyBoundCard.css'

const ValueCard = ValueCardJs as ComponentType<{
  children?: ReactNode
  className?: string
  colorScheme?: string
  size?: string
}>

export interface PublicKeyBounds {
  identifier?: string
  documentTypeName?: string | null
}

interface PublicKeyBoundCardProps extends WithClassName {
  publicKeyBounds?: PublicKeyBounds | null
}

function PublicKeyBoundCard({ publicKeyBounds, className }: PublicKeyBoundCardProps) {
  return (
    <ValueCard className={`PublicKeyBoundCard ${className || ''}`} colorScheme={'transparent'}>
      <div className={'PublicKeyBoundCard__Title'}>Bound to</div>
      <div className={'PublicKeyBoundCard__Id'}>
        <ValueContainer
          colorScheme={'lightGray'}
          elipsed={true}
          size={'xs'}
          clickable={true}
          link={'/dataContract/' + publicKeyBounds?.identifier}
        >
          {publicKeyBounds?.identifier}
        </ValueContainer>
      </div>
      <div className={'PublicKeyBoundCard__Type'}>
        <span className={'PublicKeyBoundCard__TypeTitle'}>Document Type:</span>
        <span className={'PublicKeyBoundCard__TypeValue'}>{publicKeyBounds?.documentTypeName}</span>
      </div>
    </ValueCard>
  )
}

export default PublicKeyBoundCard
