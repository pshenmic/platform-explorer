import Link from 'next/link'
import ImageGenerator from '../imageGenerator'
import { Identifier, Alias, DateBlock } from '../data'
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

        {(() => {
          const activeAlias = aliases?.find(alias => alias.status === 'ok')
          return aliases?.find(alias => alias.status === 'ok')
            ? <Alias
                className={'IdentitiesListItem__Alias'}
                alias={activeAlias.alias}
              />
            : <Identifier
                className={'IdentitiesListItem__Identifier'}
                styles={['highlight-both']}
              >
                {identifier}
              </Identifier>
        })()}
      </div>

      {isSystem && <div>SYSTEM</div>}

      {(typeof timestamp === 'string') &&
        <div className={'IdentitiesListItem__Timestamp'}>
          <DateBlock
            format={'dateOnly'}
            showTime={true}
            timestamp={timestamp}
            showRelativeTooltip={true}
          />
        </div>
      }
    </Link>
  )
}

export default IdentitiesListItem
