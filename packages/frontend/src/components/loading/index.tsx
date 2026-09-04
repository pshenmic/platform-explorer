import type { ComponentPropsWithoutRef } from 'react'
import type { WithChildren, WithClassName } from '../../types/common'
import './LoadingLine.css'
import './LoadingBlock.css'
import './LoadingList.css'

function toCssSize(value?: string | number): string | undefined {
  if (value === undefined) return undefined
  if (typeof value === 'number') return `${value * 0.25}rem`
  return value
}

interface LoadingLineProps extends WithChildren, WithClassName {
  colorScheme?: string
  loading?: boolean
  w?: string | number
  h?: string | number
}

function LoadingLine({
  children,
  colorScheme,
  loading,
  w = '100%',
  h = '20px',
  className = ''
}: LoadingLineProps) {
  const schemes: Record<string, string> = {
    gray: 'LoadingLine--Gray'
  }
  const colorSchemeClass = (colorScheme && schemes[colorScheme]) || ''

  if (children === undefined || loading) {
    return (
      <div
        className={`LoadingLine ${colorSchemeClass} ${className || ''}`}
        style={{ width: toCssSize(w), height: toCssSize(h) }}
      />
    )
  }

  return <>{children}</>
}

interface LoadingBlockProps
  extends WithChildren,
    WithClassName,
    Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'> {
  loading?: boolean
  w?: string | number
  h?: string | number
}

function LoadingBlock({
  children,
  loading,
  w = '100%',
  h = '100%',
  className = '',
  style,
  ...props
}: LoadingBlockProps) {
  if (children === undefined || loading) {
    return (
      <div
        className={`LoadingBlock ${className}`}
        style={{ width: toCssSize(w), height: toCssSize(h), ...style }}
        {...props}
      />
    )
  }

  return <>{children}</>
}

interface LoadingListProps {
  itemsCount?: number
}

const LoadingList = ({ itemsCount }: LoadingListProps) => {
  const count =
    Number.isFinite(itemsCount) && (itemsCount as number) > 0
      ? Math.min(Math.floor(itemsCount as number), 200)
      : 0

  return (
    <div className={'LoadingList'}>
      {Array.from({ length: count }).map((_e, i) => (
        <LoadingLine h={9} className={'LoadingList__Item'} key={i} />
      ))}
    </div>
  )
}

export { LoadingLine, LoadingBlock, LoadingList }
