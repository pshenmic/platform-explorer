import Link from 'next/link'
import ImageGenerator from '../imageGenerator'
import './IdentitiesListItem.scss'

function IdentitiesListItem ({ identity }) {
  const { identifier, timestamp, isSystem } = identity

  return (
    <Link
        href={`/identity/${identifier}`}
        className={'IdentitiesListItem'}
    >
        <div className={'IdentitiesListItem__IdentifierContainer'}>
            <ImageGenerator className={'IdentitiesListItem__Avatar'} username={identifier} lightness={50} saturation={50} width={28} height={28}/>
            <div className={'IdentitiesListItem__Identifier'}>{identifier}</div>
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
