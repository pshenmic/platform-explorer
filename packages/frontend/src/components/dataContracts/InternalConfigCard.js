import { ValueContainer } from '../ui/containers'
import './InternalConfigCard.scss'

function InternalConfigCard ({ config, className }) {
  const boolColors = {
    true: 'green',
    false: 'red'
  }

  const storageKeyRequirementsColors = {
    Unique: 'green',
    Multiple: 'blue',
    MultipleReferenceToLatest: 'orange'
  }

  return (
    <div className={`InfoBlock InfoBlock--Gradient InternalConfigCard ${className || ''}`}>

      <div className={'InternalConfigCard__Line'}>
        <div className={'InternalConfigCard__Title'}>
          Can Contract Be Deleted
        </div>
        <ValueContainer
          className={'InternalConfigCard__ValueContainer'}
          size={'sm'}
          colorScheme={boolColors?.[config?.canBeDeleted]}
        >
          {config?.canBeDeleted ? 'Yes' : 'No'}
        </ValueContainer>
      </div>

      <div className={'InternalConfigCard__Line'}>
        <div className={'InternalConfigCard__Title'}>
          Is Contract Read-Only
        </div>
        <ValueContainer
          className={'InternalConfigCard__ValueContainer'}
          size={'sm'}
          colorScheme={boolColors?.[config?.readonly]}
        >
          {config?.readonly ? 'Yes' : 'No'}
        </ValueContainer>
      </div>

      <div className={'InternalConfigCard__Line'}>
        <div className={'InternalConfigCard__Title'}>
          Track Contract Changes
        </div>
        <ValueContainer
          className={'InternalConfigCard__ValueContainer'}
          size={'sm'}
          colorScheme={boolColors?.[config?.keepsHistory]}
        >
          {config?.keepsHistory ? 'Yes' : 'No'}
        </ValueContainer>
      </div>

      <div className={'InternalConfigCard__Line'}>
        <div className={'InternalConfigCard__Title'}>
          Track Document Changes By Default
        </div>
        <ValueContainer
          className={'InternalConfigCard__ValueContainer'}
          size={'sm'}
          colorScheme={boolColors?.[config?.documentsKeepHistoryContractDefault]}
        >
          {config?.documentsKeepHistoryContractDefault ? 'Yes' : 'No'}
        </ValueContainer>
      </div>

      <div className={'InternalConfigCard__Line'}>
        <div className={'InternalConfigCard__Title'}>
          Are Documents Editable By Default
        </div>
        <ValueContainer
          className={'InternalConfigCard__ValueContainer'}
          size={'sm'}
          colorScheme={boolColors?.[config?.documentsMutableContractDefault]}
        >
          {config?.documentsMutableContractDefault ? 'Yes' : 'No'}
        </ValueContainer>
      </div>

      <div className={'InternalConfigCard__Line'}>
        <div className={'InternalConfigCard__Title'}>
          Can Documents Be Deleted By Default
        </div>
        <ValueContainer
          className={'InternalConfigCard__ValueContainer'}
          size={'sm'}
          colorScheme={boolColors?.[config?.documentsCanBeDeletedContractDefault]}
        >
          {config?.documentsCanBeDeletedContractDefault ? 'Yes' : 'No'}
        </ValueContainer>
      </div>

      {config?.requiresIdentityEncryptionBoundedKey &&
        <div className={'InternalConfigCard__Line'}>
          <div className={'InternalConfigCard__Title'}>
            Encryption Key Requirements
          </div>
          <ValueContainer
            className={'InternalConfigCard__ValueContainer'}
            size={'sm'}
            colorScheme={storageKeyRequirementsColors?.[config?.requiresIdentityEncryptionBoundedKey] || 'gray'}
          >
            {config?.requiresIdentityEncryptionBoundedKey}
          </ValueContainer>
        </div>
      }

      {config?.requiresIdentityDecryptionBoundedKey &&
        <div className={'InternalConfigCard__Line'}>
          <div className={'InternalConfigCard__Title'}>
            Decryption Key Requirements
          </div>
          <ValueContainer
            className={'InternalConfigCard__ValueContainer'}
            size={'sm'}
            colorScheme={storageKeyRequirementsColors?.[config?.requiresIdentityDecryptionBoundedKey] || 'gray'}
          >
            {config?.requiresIdentityDecryptionBoundedKey}
          </ValueContainer>
        </div>
      }
    </div>
  )
}

export default InternalConfigCard
