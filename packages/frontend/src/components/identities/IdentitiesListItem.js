import Link from 'next/link'
import './IdentitiesListItem.scss'

function IdentitiesListItem ({ identity }) {
  const { identifier, timestamp, isSystem } = identity

  return (
    <Link
        href={`/identity/${identifier}`}
        className={'IdentitiesListItem'}
    >
        <div className={'IdentitiesListItem__Identifier'}>
            {identifier}
        </div>

        {isSystem && <div>SYSTEM</div>}

        {(typeof timestamp === 'string') &&
            <div className={'IdentitiesListItem__Timestamp'}>
                {new Date(timestamp).toLocaleString()}
            </div>
        }
    </Link>
  )
}

export default IdentitiesListItem
