'use client'

import type { Dispatch, SetStateAction } from 'react'

interface GovDotsProps {
  count: number
  index: number
  setIndex: Dispatch<SetStateAction<number>>
}

// stories-style segment pager for the governance cells; pills sit in a >=20px hit target
export function GovDots({ count, index, setIndex }: GovDotsProps) {
  if (count <= 1) return null
  return (
    <span className={'HomeHero__GovDots'}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type={'button'}
          aria-label={`Show item ${i + 1}`}
          aria-current={i === index || undefined}
          className={`HomeHero__GovSeg ${i === index ? 'is-active' : ''}`}
          onClick={() => setIndex(i)}
        >
          <i />
        </button>
      ))}
    </span>
  )
}
