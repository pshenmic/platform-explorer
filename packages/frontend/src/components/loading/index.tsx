import { Container } from '@chakra-ui/react'
import type { ComponentPropsWithoutRef } from 'react'
import type { WithChildren, WithClassName } from '../../types/common'
import './LoadingLine.css'
import './LoadingBlock.css'
import './LoadingList.css'

interface LoadingLineProps extends WithChildren, WithClassName {
  colorScheme?: string
  loading?: boolean
  w?: string | number
  h?: string | number
}

function LoadingLine ({ children, colorScheme, loading, w = '100%', h = '20px', className = '' }: LoadingLineProps) {
  const schemes: Record<string, string> = {
    gray: 'LoadingLine--Gray'
  }
  const colorSchemeClass = (colorScheme && schemes[colorScheme]) || ''

  if (children === undefined || loading) {
    return <Container p={0} w={w} h={h} maxW={'none'} className={`LoadingLine ${colorSchemeClass} ${className || ''}`}></Container>
  }

  return <>{children}</>
}

interface LoadingBlockProps extends WithChildren, WithClassName, Omit<ComponentPropsWithoutRef<typeof Container>, 'children' | 'className'> {
  loading?: boolean
  w?: string | number
  h?: string | number
}

function LoadingBlock ({ children, loading, w = '100%', h = '100%', className = '', ...props }: LoadingBlockProps) {
  if (children === undefined || loading) {
    return <Container w={w} h={h} maxW={'none'} className={`LoadingBlock ${className}`} {...props}></Container>
  }

  return <>{children}</>
}

interface LoadingListProps {
  itemsCount?: number
}

const LoadingList = ({ itemsCount }: LoadingListProps) => {
  // Guard NaN/Infinity/negative — Array(NaN) throws RangeError: Invalid array length
  const count = Number.isFinite(itemsCount) && (itemsCount as number) > 0
    ? Math.min(Math.floor(itemsCount as number), 200)
    : 0

  return (
    <div className={'LoadingList'}>
        {Array.from({ length: count }).map((_e, i) => <LoadingLine h={9} className={'LoadingList__Item'} key={i}/>)}
    </div>
  )
}

export {
  LoadingLine,
  LoadingBlock,
  LoadingList
}
