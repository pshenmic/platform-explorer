import Link from 'next/link'
import './DataContractsListItem.scss'

function DataContractsListItem ({ dataContract }) {
  const { identifier, timestamp, isSystem } = dataContract

  return (
    <Link
        href={`/dataContract/${identifier}`}
        className={'DataContractsListItem'}
    >
        <div className={'DataContractsListItem__Identifier'}>
            {identifier}
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
