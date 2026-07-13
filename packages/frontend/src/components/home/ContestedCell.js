'use client'

import Link from 'next/link'
import contestedResources from '../../util/contestedResources'
import { useRotator, useCountUp } from './hooks'
import { contestedHref } from './utils'
import { GovDots } from './GovDots'

// the rotator and the dot pager must share one list, or the active dot runs off the pager
const FEED_LIMIT = 6

// Count + pill (left); rotating active/latest contested name over bullet dots (right).
export function ContestedCell ({ count, active, latest }) {
  const activeItems = active?.data?.resultSet || []
  const latestItems = latest?.data?.resultSet || []
  const feed = (activeItems.length > 0 ? activeItems : latestItems).slice(0, FEED_LIMIT)
  const rotator = useRotator(feed)
  const countAnimated = useCountUp(typeof count === 'number' ? count : null)

  const item = rotator.item
  const name = item ? contestedResources.getResourceValue(item.resourceValue) : null
  const dotCount = rotator.length

  return (
    <div className={'HomeHero__Gov'}>
      <div className={'HomeHero__GovLeft'}>
        <Link href={'/contestedResources'} className={'HomeHero__GovCount'}>
          {typeof countAnimated === 'number' ? countAnimated : '-'}
        </Link>
        <span className={'HomeHero__GovCountLabel'}>names</span>
      </div>

      {item &&
        <div
          className={'HomeHero__GovFeed'}
          onMouseEnter={rotator.onMouseEnter}
          onMouseLeave={rotator.onMouseLeave}
        >
          <Link href={contestedHref(item.resourceValue)} className={'HomeHero__ContestedName'} title={name}>
            {name}
          </Link>
          <GovDots count={dotCount} index={rotator.index} setIndex={rotator.setIndex}/>
        </div>}
    </div>
  )
}
