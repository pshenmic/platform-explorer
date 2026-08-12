import type { ComponentType, ReactNode } from 'react'
import { ValueCard as ValueCardJs } from '../cards'
// Untyped JS components — loose wrappers until data/* is migrated
import { InfoLine as InfoLineJs } from '../data'
import type { WithClassName } from '../../types/common'
import './PublicKeyCard.css'

const InfoLine = InfoLineJs as ComponentType<{
  className?: string
  title?: ReactNode
  value?: ReactNode
  error?: boolean
  loading?: boolean
  icon?: ReactNode
}>
const ValueCard = ValueCardJs as ComponentType<{
  children?: ReactNode
  link?: string
  className?: string
  clickable?: boolean
  loading?: boolean
}>

export interface PublicKeyData {
  id?: number | string | null
  publicKeyHash?: string | null
  type?: string | number | null
  purpose?: string | number | null
  securityLevel?: string | number | null
  data?: string | null
  readOnly?: boolean | null
}

interface PublicKeyCardProps extends WithClassName {
  publicKey?: PublicKeyData | null
}

function PublicKeyCard ({ publicKey, className }: PublicKeyCardProps) {
  return (
    <div className={`InfoBlock InfoBlock--Gradient PublicKeyCard ${className || ''}`}>

      {publicKey?.id !== undefined &&
        <InfoLine
          className={'PublicKeyCard__InfoLine'}
          title={'Key Id'}
          value={publicKey?.id}
          error={publicKey?.id === null}
        />
      }

      {publicKey?.publicKeyHash !== undefined &&
         <InfoLine
          className={'PublicKeyCard__InfoLine PublicKeyCard__InfoLine--Hash'}
          title={'Public Key Hash'}
          value={publicKey?.publicKeyHash}
          error={publicKey?.publicKeyHash === null}
         />
      }

      {publicKey?.type !== undefined &&
        <InfoLine
          className={'PublicKeyCard__InfoLine'}
          title={'Type'}
          value={publicKey?.type}
          error={publicKey?.type === null}
        />
      }

      {publicKey?.purpose !== undefined &&
        <InfoLine
          className={'PublicKeyCard__InfoLine'}
          title={'Purpose'}
          value={publicKey?.purpose}
          error={publicKey?.purpose === null}
        />
      }

      {publicKey?.securityLevel !== undefined &&
        <InfoLine
          className={'PublicKeyCard__InfoLine'}
          title={'Security Level'}
          value={publicKey?.securityLevel}
          error={publicKey?.securityLevel === null}
        />
      }

      {publicKey?.data !== undefined &&
        <InfoLine
          className={'PublicKeyCard__InfoLine PublicKeyCard__InfoLine--Data'}
          title={'Data'}
          value={<ValueCard>{publicKey?.data}</ValueCard>}
          error={publicKey?.data === null}
        />
      }

      {publicKey?.readOnly !== undefined &&
        <InfoLine
          className={'PublicKeyCard__InfoLine'}
          title={'Read only'}
          value={publicKey?.readOnly ? 'True' : 'False'}
          error={publicKey?.id === null}
        />
      }
    </div>
  )
}

export default PublicKeyCard
