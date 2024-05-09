import IdentitiesListItem from './IdentitiesListItem'
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
                <div className={'IdentitiesList__EmptyMessage'}>There are no identities created yet.</div>
            }
        </div>
  )
}

export default IdentitiesList
