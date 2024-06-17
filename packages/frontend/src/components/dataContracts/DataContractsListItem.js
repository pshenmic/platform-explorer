import Link from 'next/link'
import './DataContractsListItem.scss'

function DataContractsListItem ({ dataContract }) {
  const { identifier, name, timestamp, isSystem } = dataContract

  return (
    <Link
        href={`/dataContract/${identifier}`}
        className={'DataContractsListItem'}
    >
        <div className={'DataContractsListItem__Identifier'}>
          {name ? <b>{name}</b> : identifier}
        </div>

        {isSystem && <div>SYSTEM</div>}

        {(typeof timestamp === 'string') &&
            <div className={'DataContractsListItem__Timestamp'}>
                {new Date(timestamp).toLocaleString()}
            </div>
        }
    </Link>
  )
}

export default DataContractsListItem
