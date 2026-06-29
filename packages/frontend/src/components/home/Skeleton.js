import './Skeleton.scss'

// Tiny pulsing skeleton block. Size it to match the real element it stands in for so the
// swap to real content causes no layout shift.
export function Skeleton ({ w, h = '0.7em', radius = 4, circle = false, className = '' }) {
  return (
    <span
      className={`Skeleton ${className}`}
      aria-hidden={'true'}
      style={{ width: w, height: circle ? w : h, borderRadius: circle ? '50%' : radius }}
    />
  )
}
