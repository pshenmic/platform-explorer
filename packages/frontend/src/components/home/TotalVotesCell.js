'use client'

import Link from 'next/link'
import ChoiceBadge from '../contestedResources/ChoiceBadge'
import { useRotator, useCountUp } from './hooks'
import { trimName } from './utils'
import { GovDots } from './GovDots'

// the rotator and the dot pager must share one list, or the active dot runs off the pager
const FEED_LIMIT = 6

// Count + pill (left); rotating latest vote (choice badge + voter) over bullet dots (right).
export function TotalVotesCell ({ count, votes }) {
  const items = (votes?.data?.resultSet || []).slice(0, FEED_LIMIT)
  const rotator = useRotator(items)
  const countAnimated = useCountUp(typeof count === 'number' ? count : null)

  const item = rotator.item
  const dotCount = rotator.length

  return (
    <div className={'HomeHero__Gov'}>
      <div className={'HomeHero__GovLeft'}>
        <Link href={'/masternodeVotes'} className={'HomeHero__GovCount'}>
          {typeof countAnimated === 'number' ? countAnimated : '-'}
        </Link>
        <span className={'HomeHero__GovCountLabel'}>casted</span>
      </div>

      {item &&
        <div
          className={'HomeHero__GovFeed'}
          onMouseEnter={rotator.onMouseEnter}
          onMouseLeave={rotator.onMouseLeave}
        >
          {/* key remounts the ticker so each rotation slides in */}
          <span key={rotator.index} className={'HomeHero__GovTicker'}>
            <Link
              // regular voters have no detail page, so the entry opens the votes list
              href={'/masternodeVotes'}
              className={'HomeHero__VotesItem'}
            >
              {typeof item.choice === 'number'
                ? <ChoiceBadge className={'HomeHero__VotesChoice'} choice={item.choice}/>
                : <span className={'HomeHero__VotesChoiceText'}>{String(item.choice ?? 'vote')}</span>}
              <span className={'HomeHero__VotesVoter'}>
                {(() => {
                  // middle-trim; aliases keep the accented .dash suffix, raw ids get the same shape
                  const alias = item.identityAliases?.[0]?.alias
                  const { text, dash } = trimName(alias || item.voterIdentifier)
                  return <>{text}{dash && <span className={'HomeHero__GovTld'}>.dash</span>}</>
                })()}
              </span>
            </Link>
          </span>
          <GovDots count={dotCount} index={rotator.index} setIndex={rotator.setIndex}/>
        </div>}
    </div>
  )
}
