import type { ReactNode, MouseEvent } from 'react'
import Link from 'next/link'
import type { WithChildren, WithClassName } from '../../types/common'
import './ValueCard.css'

interface WrapperProps extends WithChildren, WithClassName {
  link?: string
  onMouseMove?: (e: MouseEvent) => void
}

const Wrapper = (props: WrapperProps) => {
  return props?.link ? (
    <Link onMouseMove={props.onMouseMove} href={props.link} className={props.className}>
      {props.children}
    </Link>
  ) : (
    <div onMouseMove={props.onMouseMove} className={props.className}>
      {props.children}
    </div>
  )
}

type ValueCardColorScheme = 'default' | 'transparent' | 'green'
type ValueCardSize = 'default' | 'sm'

interface ValueCardProps extends WithChildren, WithClassName {
  link?: string
  clickable?: boolean
  loading?: boolean
  colorScheme?: ValueCardColorScheme
  size?: ValueCardSize
}

export default function ValueCard({
  link,
  clickable,
  loading,
  colorScheme = 'default',
  size = 'default',
  children,
  className
}: ValueCardProps) {
  const colorClasses: Record<ValueCardColorScheme, string> = {
    default: '',
    transparent: 'ValueCard--BgTransparent',
    green: 'ValueCard--Green'
  }

  const sizeClasses: Record<ValueCardSize, string> = {
    default: '',
    sm: 'ValueCard--SizeSm'
  }

  let extraClass = ''
  if (link || clickable) extraClass += 'ValueCard--Clickable'
  extraClass += ' ' + (colorClasses?.[colorScheme] || colorClasses.default)
  extraClass += ' ' + (sizeClasses?.[size] || sizeClasses.default)

  return (
    <Wrapper
      className={`ValueCard ${className || ''} ${loading ? 'ValueCard--Loading' : ''} ${extraClass || ''}`}
      link={link}
    >
      {children}
    </Wrapper>
  )
}
