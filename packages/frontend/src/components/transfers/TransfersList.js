import TransfersListItem from './TransfersListItem'
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
                <div className={'TransfersList__EmptyMessage'}>There are no transfers yet.</div>
            }
        </div>
  )
}

export default TransfersList
