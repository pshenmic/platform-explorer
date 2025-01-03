import Link from 'next/link'
import ImageGenerator from '../imageGenerator'
import './DataContractsListItem.scss'
import { Alias, DateBlock, Identifier } from '../data'

function DataContractsListItem ({ dataContract }) {
  return (
    <Link
      href={`/dataContract/${dataContract?.identifier}`}
      className={'DataContractsListItem'}
    >
      <div className={'DataContractsListItem__IdentifierContainer'}>
        {dataContract?.name
          ? <>
              <ImageGenerator className={'DataContractsListItem__Avatar'} username={dataContract?.identifier} lightness={50} saturation={50} width={24} height={24}/>
              <Alias>{dataContract.name}</Alias>
            </>
          : <Identifier
            className={'DataContractsListItem__Identifier'}
            avatar={true}
            styles={['highlight-both']}
            ellipsis={false}
          >
            {dataContract.identifier}
          </Identifier>}
      </div>

      {dataContract?.isSystem && <div className={'DataContractsListItem__SystemLabel'}>SYSTEM</div>}

      {(typeof dataContract?.timestamp === 'string') &&
        <div className={'DataContractsListItem__Timestamp'}>
          <DateBlock timestamp={dataContract?.timestamp} format={'dateOnly'} showTime={true}/>
        </div>
      }
    </Link>
  )
}

export default DataContractsListItem
