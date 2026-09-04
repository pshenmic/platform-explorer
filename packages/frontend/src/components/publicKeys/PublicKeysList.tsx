import PublicKeysListItem from './PublicKeysListItem'
import type { PublicKey } from './PublicKeysListItem'
import { EmptyListMessage } from '../ui/lists'
import type { WithClassName } from '../../types/common'
import './PublicKeysList.css'
import './PublicKeysListItem.css'
import './PublicKeyBoundCard.css'

interface PublicKeysListProps extends WithClassName {
  publicKeys?: PublicKey[]
}

function PublicKeysList({ publicKeys = [], className }: PublicKeysListProps) {
  return (
    <div className={`PublicKeysList ${className || ''}`}>
      <div className={'PublicKeysList__ScrollZone'}>
        <div className={'PublicKeysList__ColumnTitles'}>
          <div className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Id'}>
            Key Id
          </div>
          <div
            className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--PublicKeyHash'}
          >
            Public Key Hash
          </div>
          <div className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Type'}>
            Type
          </div>
          <div className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Purpose'}>
            Purpose
          </div>
          <div
            className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--SecurityLevel'}
          >
            Security Level
          </div>
          <div
            className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--DisabledAt'}
          >
            Disabled
          </div>
          <div className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--ReadOnly'}>
            Read Only
          </div>
          <div className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Data'}>
            Data
          </div>
        </div>

        {publicKeys?.length > 0 &&
          publicKeys.map((publicKey, i) => <PublicKeysListItem publicKey={publicKey} key={i} />)}

        {publicKeys?.length === 0 && <EmptyListMessage>There are no public keys</EmptyListMessage>}
      </div>
    </div>
  )
}

export default PublicKeysList
