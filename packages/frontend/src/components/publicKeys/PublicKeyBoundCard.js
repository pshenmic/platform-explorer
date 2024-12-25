import { ValueContainer } from '../ui/containers'
import { ValueCard } from '../cards'
import './PublicKeyBoundCard.scss'

function PublicKeyBoundCard ({ publicKeyBounds, className }) {
  const boundTypeTitles = {
    documentType: 'Document Type'
  }

  return (
    <ValueCard className={`PublicKeyBoundCard ${className || ''}`} colorScheme={'transparent'}>
      <div className={'PublicKeyBoundCard__Title'}>Bound to</div>
      <div className={'PublicKeyBoundCard__Id'}>
        <ValueContainer
          colorScheme={'lightGray'}
          elipsed={true}
          size={'xs'}
          clickable={true}
          link={'/dataContract/' + publicKeyBounds?.id}
        >
          {publicKeyBounds?.id}
        </ValueContainer>
      </div>
      <div className={'PublicKeyBoundCard__Type'}>
        <span className={'PublicKeyBoundCard__TypeTitle'}>
          {boundTypeTitles[publicKeyBounds?.type] || publicKeyBounds.type}:
        </span>
        <span className={'PublicKeyBoundCard__TypeValue'}>
          {publicKeyBounds.typeName}
        </span>
      </div>
    </ValueCard>
  )
}

export default PublicKeyBoundCard
