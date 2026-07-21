import './Skeleton.scss'

// pulsing placeholder; size it to match the real element so the swap causes no layout shift
export function Skeleton ({ w, h = '0.7em', radius = 4, circle = false, className = '' }) {
  return (
    <span
      className={`Skeleton ${className}`}
      aria-hidden={'true'}
      style={{ width: w, height: circle ? w : h, borderRadius: circle ? '50%' : radius }}
    />
  )
}
