import { ValueCard } from '../cards'
import { InfoLine } from '../data'
import './PublicKeyCard.scss'

function PublicKeyCard ({ publicKey, className }) {
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
