import type { CSSProperties } from 'react'
import type { WithClassName } from '../../types'
import './Skeleton.scss'

interface SkeletonProps extends WithClassName {
  w?: string | number
  h?: string | number
  radius?: string | number
  circle?: boolean
}

// pulsing placeholder; size it to match the real element so the swap causes no layout shift
export function Skeleton ({ w, h = '0.7em', radius = 4, circle = false, className = '' }: SkeletonProps) {
  const style: CSSProperties = {
    width: w,
    height: circle ? w : h,
    borderRadius: circle ? '50%' : radius
  }

  return (
    <span
      className={`Skeleton ${className}`}
      aria-hidden={'true'}
      style={style}
    />
  )
}
