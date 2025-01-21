import { ValueContainer } from '../ui/containers'
import './InternalConfigCard.scss'

function InternalConfigCard ({ config, className }) {
  console.log('config', config)

  const getColorScheme = (boolValue) => {
    if (boolValue) return 'green'
    return 'red'
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
          colorScheme={getColorScheme(config?.canBeDeleted)}
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
          colorScheme={getColorScheme(config?.readonly)}
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
          colorScheme={getColorScheme(config?.keepsHistory)}
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
          colorScheme={getColorScheme(config?.documentsKeepHistoryContractDefault)}
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
          colorScheme={getColorScheme(config?.documentsMutableContractDefault)}
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
          colorScheme={getColorScheme(config?.documentsCanBeDeletedContractDefault)}
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
          >
            {config?.requiresIdentityEncryptionBoundedKey}
          </ValueContainer>
        </div>
      }

      {config?.requiresIdentityDecryptionBoundedKey !== null &&
        <div className={'InternalConfigCard__Line'}>
          <div className={'InternalConfigCard__Title'}>
            Decryption Key Requirements
          </div>
          <ValueContainer
            className={'InternalConfigCard__ValueContainer'}
            size={'sm'}
          >
            {config?.requiresIdentityDecryptionBoundedKey}
          </ValueContainer>
        </div>
      }
    </div>
  )
}

export default InternalConfigCard
