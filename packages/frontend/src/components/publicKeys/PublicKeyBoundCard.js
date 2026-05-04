import { ValueContainer } from '../ui/containers'
import { ValueCard } from '../cards'
import './PublicKeyBoundCard.scss'

function PublicKeyBoundCard ({ publicKeyBounds, className }) {
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
        <span className={'PublicKeyBoundCard__TypeValue'}>
          {publicKeyBounds?.documentTypeName}
        </span>
      </div>
    </ValueCard>
  )
}

export default PublicKeyBoundCard
