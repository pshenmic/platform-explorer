import TransfersListItem from './TransfersListItem'
import { EmptyListMessage } from '../ui/lists'
import './TransfersList.scss'

function TransfersList ({ transfers = [], identityId }) {
  return (
    <div className={'TransfersList'}>
      {transfers.map((transfer, key) =>
        <TransfersListItem
          key={key}
          transfer={transfer}
          identityId={identityId}
        />
      )}

      {transfers.length === 0 &&
        <EmptyListMessage>There are no transfers yet.</EmptyListMessage>
      }
    </div>
  )
}

export default TransfersList
