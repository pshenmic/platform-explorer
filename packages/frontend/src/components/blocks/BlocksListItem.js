import Link from 'next/link'
import { Identifier } from '../data'
import './BlocksListItem.scss'

function BlocksListItem ({ block }) {
  const { header, txs } = block
  const { hash, height, timestamp } = header

  return (
    <Link href={`/block/${hash}`} className={'BlocksListItem'}>
      {(typeof height === 'number' &&
        <span className={'BlocksListItem__Height'}>{height}</span>
      )}

      {typeof timestamp === 'string' &&
        <span className={'BlocksListItem__Timestamp'}>
          {new Date(timestamp).toLocaleString()}
        </span>
      }

      {typeof hash === 'string' &&
        <Identifier className={'BlocksListItem__Hash'} styles={['highlight-both']}>
          {hash}
        </Identifier>
      }

      {(typeof txs.length === 'number') &&
        <span className={'BlocksListItem__Txs'}>({txs.length} txs)</span>
      }
    </Link>
  )
}

export default BlocksListItem
