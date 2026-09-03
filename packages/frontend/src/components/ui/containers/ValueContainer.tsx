import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { ArrowCornerIcon } from '../icons'
import Link from 'next/link'
import type { WithChildren, WithClassName } from '../../../types/common'
import './ValueContainer.css'

type ColorScheme =
  | 'default'
  | 'red'
  | 'green'
  | 'emeralds'
  | 'blue'
  | 'brand'
  | 'lightGray'
  | 'darkGray'
  | 'gray'
  | 'orange'

type Size = 'default' | 'xl' | 'lg' | 'md' | 'sm' | 'xs' | 'xxs'

interface WrapperProps extends WithChildren, WithClassName {
  external?: boolean
  link?: string
  [key: string]: unknown
}

const Wrapper = ({ external, link, children, className, ...otherProps }: WrapperProps) => {
  return typeof link === 'string' ? (
    <Link
      href={link}
      {...(external && { target: '_blank', rel: 'noreferrer' })}
      className={className}
      {...otherProps}
    >
      {children}
    </Link>
  ) : (
    <div className={className} {...(otherProps as ComponentPropsWithoutRef<'div'>)}>
      {children}
    </div>
  )
}

interface ValueContainerProps extends WithChildren, WithClassName {
  clickable?: boolean
  link?: string
  elipsed?: boolean
  colorScheme?: ColorScheme
  size?: Size
  external?: boolean
  light?: boolean
  [key: string]: unknown
}

function ValueContainer({
  children,
  clickable,
  link,
  elipsed = false,
  colorScheme = 'default',
  size = 'default',
  external,
  light,
  className,
  ...props
}: ValueContainerProps) {
  const colorClasses: Record<ColorScheme, string> = {
    default: '',
    red: 'ValueContainer--Red',
    green: 'ValueContainer--Green',
    emeralds: 'ValueContainer--Emeralds',
    blue: 'ValueContainer--Blue',
    brand: 'ValueContainer--Brand',
    lightGray: 'ValueContainer--LightGray',
    darkGray: 'ValueContainer--DarkGray',
    gray: 'ValueContainer--Gray',
    orange: 'ValueContainer--Orange'
  }

  const sizeClasses: Record<Size, string> = {
    default: '',
    xl: 'ValueContainer--SizeXl',
    lg: 'ValueContainer--SizeLg',
    md: 'ValueContainer--SizeMd',
    sm: 'ValueContainer--SizeSm',
    xs: 'ValueContainer--SizeXs',
    xxs: 'ValueContainer--SizeXxs'
  }

  let extraClass = ''

  if (clickable || link) extraClass += ' ValueContainer--Clickable'
  if (external) extraClass += ' ValueContainer--External'
  if (light) extraClass += ' ValueContainer--Light'
  if (elipsed) extraClass += ' ValueContainer--Elipsed'

  extraClass += ' ' + (colorClasses?.[colorScheme] || colorClasses.default)
  extraClass += ' ' + (sizeClasses?.[size] || sizeClasses.default)

  return (
    <Wrapper
      link={link}
      external={external}
      className={`ValueContainer ${extraClass || ''} ${className || ''}`}
      {...props}
    >
      {external && (
        <div className={'ValueContainer__ExternalIcon'}>
          <ArrowCornerIcon color={'brand.normal'} w={'10px'} h={'10px'} mr={'12px'} />
        </div>
      )}
      <div className={'ValueContainer__Value'}>{children as ReactNode}</div>
    </Wrapper>
  )
}

export default ValueContainer
