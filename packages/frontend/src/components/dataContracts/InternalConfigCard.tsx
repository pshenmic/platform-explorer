import { ValueContainer } from '../ui/containers'
import type { WithClassName } from '../../types'
import './InternalConfigCard.scss'

const storageKeyRequirementsColors: Record<string, 'green' | 'blue' | 'orange'> = {
  Unique: 'green',
  Multiple: 'blue',
  MultipleReferenceToLatest: 'orange'
}

const boolColors: Record<string, 'green' | 'red'> = {
  true: 'green',
  false: 'red'
}

interface InternalConfig {
  canBeDeleted?: boolean
  readonly?: boolean
  keepsHistory?: boolean
  documentsKeepHistoryContractDefault?: boolean
  documentsMutableContractDefault?: boolean
  documentsCanBeDeletedContractDefault?: boolean
  requiresIdentityEncryptionBoundedKey?: string | null
  requiresIdentityDecryptionBoundedKey?: string | null
}

interface InternalConfigCardProps extends WithClassName {
  config?: InternalConfig | null
}

function InternalConfigCard ({ config, className }: InternalConfigCardProps) {
  return (
    <div className={`InfoBlock InfoBlock--Gradient InternalConfigCard ${className || ''}`}>

      <div className={'InternalConfigCard__Line'}>
        <div className={'InternalConfigCard__Title'}>
          Can Contract Be Deleted
        </div>
        <ValueContainer
          className={'InternalConfigCard__ValueContainer'}
          size={'sm'}
          colorScheme={boolColors?.[String(config?.canBeDeleted)]}
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
          colorScheme={boolColors?.[String(config?.readonly)]}
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
          colorScheme={boolColors?.[String(config?.keepsHistory)]}
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
          colorScheme={boolColors?.[String(config?.documentsKeepHistoryContractDefault)]}
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
          colorScheme={boolColors?.[String(config?.documentsMutableContractDefault)]}
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
          colorScheme={boolColors?.[String(config?.documentsCanBeDeletedContractDefault)]}
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
