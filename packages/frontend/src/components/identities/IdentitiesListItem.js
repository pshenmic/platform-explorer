import Link from 'next/link'
import ImageGenerator from '../imageGenerator'
import { Identifier } from '../data'
import './IdentitiesListItem.scss'

function IdentitiesListItem ({ identity }) {
  const { identifier, timestamp, isSystem } = identity

  const alias = Math.floor(Math.random() * 2) ? 'alias' : null

  return (
    <Link
      href={`/identity/${identifier}`}
      className={'IdentitiesListItem'}
    >
      <div className={'IdentitiesListItem__IdentifierContainer'}>
        <ImageGenerator className={'IdentitiesListItem__Avatar'} username={identifier} lightness={50} saturation={50} width={28} height={28}/>

        {alias
          ? <div className={'IdentitiesListItem__Alias'}>{alias}</div>
          : <Identifier
              className={'IdentitiesListItem__Identifier'}
              copyButton={true}
              styles={['highlight-both']}
            >
              {identifier}
            </Identifier>
        }
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
