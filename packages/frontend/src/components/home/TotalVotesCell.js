'use client'

import Link from 'next/link'
import ChoiceBadge from '../contestedResources/ChoiceBadge'
import { useRotator, useCountUp } from './hooks'
import { shortId } from './utils'
import { GovDots } from './GovDots'

// Count + pill (left); rotating latest vote (choice badge + voter) over bullet dots (right).
export function TotalVotesCell ({ count, votes }) {
  const items = votes?.data?.resultSet || []
  const rotator = useRotator(items)
  const countAnimated = useCountUp(typeof count === 'number' ? count : null)

  const item = rotator.item
  const dotCount = Math.min(rotator.length, 6)

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
          <Link href={'/masternodeVotes'} className={'HomeHero__VotesItem'}>
            {typeof item.choice === 'number'
              ? <ChoiceBadge className={'HomeHero__VotesChoice'} choice={item.choice}/>
              : <span className={'HomeHero__VotesChoiceText'}>{String(item.choice ?? 'vote')}</span>}
            <span className={'HomeHero__VotesVoter'}>
              {item.identityAliases?.[0]?.alias || shortId(item.voterIdentifier)}
            </span>
          </Link>
          <GovDots count={dotCount} index={rotator.index} setIndex={rotator.setIndex}/>
        </div>}
    </div>
  )
}
