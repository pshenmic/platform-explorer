import Link from 'next/link'
import ImageGenerator from '../imageGenerator'
import './DataContractsListItem.scss'

function DataContractsListItem ({ dataContract }) {
  const { identifier, name, timestamp, isSystem } = dataContract

  return (
    <Link
        href={`/dataContract/${identifier}`}
        className={'DataContractsListItem'}
    >
        <div className={'DataContractsListItem__IdentifierContainer'}>
            <ImageGenerator className={'DataContractsListItem__Avatar'} username={identifier} lightness={50} saturation={50} width={28} height={28}/>
            <div className={'DataContractsListItem__Identifier'}>{name ? <b>{name}</b> : identifier}</div>
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
