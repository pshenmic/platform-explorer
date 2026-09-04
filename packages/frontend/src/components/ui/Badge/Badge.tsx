import type { HTMLAttributes, ReactNode } from 'react'
import './Badge.css'

const COLOR_SCHEMES = [
  'red',
  'green',
  'gray',
  'dimGray',
  'blue',
  'yellow',
  'orange',
  'emerald'
] as const

export type BadgeColorScheme = (typeof COLOR_SCHEMES)[number]

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  colorScheme?: string
  size?: 'xs' | 'sm' | 'md'
  children?: ReactNode
}

export function Badge({ colorScheme = 'gray', size, className, ...props }: BadgeProps) {
  const scheme = COLOR_SCHEMES.includes(colorScheme as BadgeColorScheme)
    ? colorScheme
    : 'gray'

  const classes = [
    'PeBadge',
    `PeBadge--${scheme}`,
    size === 'xs' ? 'PeBadge--xs' : '',
    className || ''
  ]
    .filter(Boolean)
    .join(' ')

  return <span className={classes} {...props} />
}

export default Badge
