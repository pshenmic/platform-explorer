import { ValueCard } from '../cards'
import { InfoLine } from '../data'
import './PublicKeyCard.scss'

function PublicKeyCard ({ publicKey, className }) {
  return (
    <div className={`InfoBlock InfoBlock--Gradient PublicKeyCard ${className || ''}`}>
      <InfoLine
        className={'PublicKeyCard__InfoLine'}
        title={'Key Id'}
        value={publicKey?.id}
        error={publicKey?.id === undefined}
      />
       <InfoLine
        className={'PublicKeyCard__InfoLine PublicKeyCard__InfoLine--Hash'}
        title={'Public Key Hash'}
        value={publicKey?.publicKeyHash}
        error={publicKey?.publicKeyHash === undefined}
       />
      <InfoLine
        className={'PublicKeyCard__InfoLine'}
        title={'Type'}
        value={publicKey?.type}
        error={publicKey?.type === undefined}
      />
      <InfoLine
        className={'PublicKeyCard__InfoLine'}
        title={'Purpose'}
        value={publicKey?.purpose}
        error={publicKey?.purpose === undefined}
      />
      <InfoLine
        className={'PublicKeyCard__InfoLine'}
        title={'Security Level'}
        value={publicKey?.securityLevel}
        error={publicKey?.securityLevel === undefined}
      />
      <InfoLine
        className={'PublicKeyCard__InfoLine PublicKeyCard__InfoLine--Data'}
        title={'Data'}
        value={<ValueCard>{publicKey?.data}</ValueCard>}
        error={publicKey?.data === undefined}
      />
      <InfoLine
        className={'PublicKeyCard__InfoLine'}
        title={'Read only'}
        value={publicKey?.readOnly ? 'True' : 'False'}
        error={publicKey?.id === undefined}
      />
    </div>
  )
}

export default PublicKeyCard
