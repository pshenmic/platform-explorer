'use client'

import Link from 'next/link'
import { BigNumber, TimeDelta, NotActive, Identifier } from '../data'
import { BlockIcon } from '../ui/icons'
import { useLiveList } from './hooks'
import { HOME_FEED_LIMIT } from './listLimits'
import './CompactBlocksList.css'

export function CompactBlocksList({
  blocks,
  limit = HOME_FEED_LIMIT,
  loading,
  moreHref,
  moreLabel
}: {
  blocks?: any[]
  limit?: number
  loading?: boolean
  moreHref?: string
  moreLabel?: string
}) {
  const { shown, newKeys, hoverBind } = useLiveList<any>(blocks, (b: any) => b?.header?.hash)
  const rows = Array.isArray(shown) ? shown.slice(0, limit) : []
  const showSkeleton = Boolean(loading && !rows.length)

  return (
    <div className={'CompactBlocksList'} {...hoverBind}>
      <div className={'CompactBlocksList__Head'}>
        <div className={'CompactBlocksList__HeadCell'}>Height</div>
        <div className={'CompactBlocksList__HeadCell'}>Hash</div>
        <div className={'CompactBlocksList__HeadCell CompactBlocksList__HeadCell--center'}>Txs</div>
        <div className={'CompactBlocksList__HeadCell CompactBlocksList__HeadCell--right'}>Time</div>
      </div>
      <div className={'CompactBlocksList__Body'}>
        {showSkeleton
          ? Array.from({ length: limit }, (_, i) => (
              <div key={i} className={'CompactBlocksList__Row CompactBlocksList__Row--Skeleton'}>
                <div className={'CompactBlocksList__Cell'}>
                  <span className={'CompactBlocksList__Skeleton'} />
                </div>
                <div className={'CompactBlocksList__Cell'}>
                  <span className={'CompactBlocksList__Skeleton'} />
                </div>
                <div className={'CompactBlocksList__Cell CompactBlocksList__Cell--center'}>
                  <span className={'CompactBlocksList__Skeleton'} />
                </div>
                <div className={'CompactBlocksList__Cell CompactBlocksList__Cell--right'}>
                  <span className={'CompactBlocksList__Skeleton'} />
                </div>
              </div>
            ))
          : null}
        {!showSkeleton && rows.length === 0 ? (
          <div className={'CompactBlocksList__Empty'}>No blocks</div>
        ) : null}
        {rows.map((block: any, i: number) => {
          const hash = block?.header?.hash
          const height = block?.header?.height
          const txCount = Array.isArray(block?.txs) ? block.txs.length : 0
          const isNew = hash && newKeys.has(hash)
          return (
            <Link
              key={hash || i}
              href={`/block/${hash}`}
              prefetch={false}
              className={`CompactBlocksList__Row${isNew ? ' is-new' : ''}`}
              style={isNew ? ({ ['--stagger']: `${i * 50}ms` } as any) : undefined}
            >
              <div className={'CompactBlocksList__Cell'}>
                <span className={'CompactBlocksList__Height'}>
                  <BlockIcon w={'1.125rem'} h={'1.125rem'} flexShrink={0} />
                  {typeof height === 'number' ? <BigNumber>{height}</BigNumber> : <NotActive />}
                </span>
              </div>
              <div className={'CompactBlocksList__Cell'}>
                {hash ? (
                  <Identifier ellipsis={true} styles={['highlight-both']}>
                    {hash}
                  </Identifier>
                ) : (
                  <NotActive />
                )}
              </div>
              <div className={'CompactBlocksList__Cell CompactBlocksList__Cell--center'}>
                <span className={'CompactBlocksList__Txs'}>{txCount}</span>
              </div>
              <div className={'CompactBlocksList__Cell CompactBlocksList__Cell--right'}>
                {block?.header?.timestamp ? (
                  <TimeDelta
                    showTimestampTooltip={true}
                    format={'compact'}
                    endDate={new Date(block.header.timestamp)}
                  />
                ) : (
                  <NotActive />
                )}
              </div>
            </Link>
          )
        })}
      </div>
      {moreHref ? (
        <div className={'CompactBlocksList__Footer'}>
          <Link href={moreHref} prefetch={false} className={'CompactBlocksList__More'}>
            {moreLabel || 'View all'}
          </Link>
        </div>
      ) : null}
    </div>
  )
}
