'use client'

// Shared bullet-dot pager for the governance cells (Contested / Total votes).
export function GovDots ({ count, index, setIndex }) {
  if (count <= 1) return null
  return (
    <span className={'HomeHero__GovDots'}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type={'button'}
          aria-label={`Show item ${i + 1}`}
          className={`HomeHero__GovDot ${i === index ? 'is-active' : ''}`}
          onClick={() => setIndex(i)}
        />
      ))}
    </span>
  )
}
