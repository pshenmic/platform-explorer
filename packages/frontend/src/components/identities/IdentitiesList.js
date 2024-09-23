import IdentitiesListItem from './IdentitiesListItem'
import { EmptyListMessage } from '../ui/lists'
import './IdentitiesList.scss'

function IdentitiesList ({ identities }) {
  return (
        <div className={'IdentitiesList'}>
            {identities.map((identity, key) =>
                <IdentitiesListItem
                    key={key}
                    identity={identity}
                />
            )}

            {identities.length === 0 &&
                <EmptyListMessage>There are no identities created yet.</EmptyListMessage>
            }
        </div>
  )
}

export default IdentitiesList
