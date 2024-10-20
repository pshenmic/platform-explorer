import Link from 'next/link'
import ImageGenerator from '../imageGenerator'
import { Identifier, Alias } from '../data'
import './IdentitiesListItem.scss'

function IdentitiesListItem ({ identity }) {
  const { aliases, identifier, timestamp, isSystem } = identity

  return (
    <Link
      href={`/identity/${identifier}`}
      className={'IdentitiesListItem'}
    >
      <div className={'IdentitiesListItem__IdentifierContainer'}>
        <ImageGenerator className={'IdentitiesListItem__Avatar'} username={identifier} lightness={50} saturation={50} width={28} height={28}/>

        {aliases?.length
          ? <Alias className={'IdentitiesListItem__Alias'}>{aliases[0]}</Alias>
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
