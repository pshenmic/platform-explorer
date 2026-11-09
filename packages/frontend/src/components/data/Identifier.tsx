'use client'

import ImageGenerator from '../imageGenerator'
import { CopyButton } from '../ui/Buttons'
import { useRef, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { WithChildren, WithClassName } from '../../types/common'
import NotActive from './NotActive'
import './Identifier.css'

type HighlightStyle =
  | 'dim'
  | 'highlight'
  | 'highlight-first'
  | 'highlight-last'
  | 'highlight-both'
  | string
type HighlightMode = 'dim' | 'highlight' | 'first' | 'last' | 'both' | 'default'

interface IdentifierProps extends WithChildren, WithClassName {
  ellipsis?: boolean
  middleEllipsis?: boolean
  avatar?: boolean
  styles?: HighlightStyle[]
  copyButton?: boolean
  linesAdjustment?: boolean
}

export default function Identifier({
  children,
  ellipsis = true,
  middleEllipsis = false,
  avatar,
  styles = [],
  copyButton,
  linesAdjustment = true,
  className
}: IdentifierProps) {
  const symbolsContainerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [charWidth, setCharWidth] = useState(0)

  useEffect(() => {
    const element = symbolsContainerRef.current
    if (!element || !middleEllipsis) return
    const context = document.createElement('canvas').getContext('2d')
    const measure = () => {
      if (!context) return
      const styles = getComputedStyle(element)
      context.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`
      setCharWidth(context.measureText('A').width + (parseFloat(styles.letterSpacing) || 0))
      setContainerWidth(element.clientWidth)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    document.fonts.addEventListener('loadingdone', measure)
    measure()
    return () => {
      observer.disconnect()
      document.fonts.removeEventListener('loadingdone', measure)
    }
  }, [middleEllipsis])

  const highlightModes: Record<HighlightMode, { first: boolean; middle: boolean; last: boolean }> =
    {
      dim: { first: false, middle: false, last: false },
      highlight: { first: true, middle: true, last: true },
      first: { first: true, middle: false, last: false },
      last: { first: false, middle: false, last: true },
      both: { first: true, middle: false, last: true },
      default: { first: true, middle: false, last: true }
    }

  const styleToMode: Record<string, HighlightMode> = {
    dim: 'dim',
    highlight: 'highlight',
    'highlight-first': 'first',
    'highlight-last': 'last',
    'highlight-both': 'both'
  }

  const matchedStyle = styles.find(style => style in styleToMode)
  const highlightMode = matchedStyle ? styleToMode[matchedStyle] : null

  // start…end truncation sized to the available width (recomputed on resize); full value in title
  const MiddleTruncated = ({ children: middleChildren }: { children?: ReactNode }) => {
    if (!middleChildren || typeof middleChildren !== 'string') return <NotActive />

    const minEdge = 4
    const measured = charWidth && containerWidth
    const maxChars = measured ? Math.floor(containerWidth / (charWidth as number)) : minEdge * 2 + 1

    if (maxChars >= middleChildren.length) return <>{middleChildren}</>

    const keep = Math.max(maxChars - 1, minEdge * 2)
    const head = Math.max(Math.ceil(keep / 2), minEdge)
    const tail = Math.max(Math.floor(keep / 2), minEdge)

    if (head + tail >= middleChildren.length) return <>{middleChildren}</>

    return <>{`${middleChildren.slice(0, head)}…${middleChildren.slice(-tail)}`}</>
  }

  const HighlightedID = ({
    children: idChildren,
    mode
  }: {
    children?: ReactNode
    mode: HighlightMode
  }) => {
    if (!idChildren || typeof idChildren !== 'string') return <NotActive />

    const highlightedCount = 5
    const firstPart = idChildren.slice(0, highlightedCount)
    const middlePart = idChildren.slice(highlightedCount, idChildren.length - highlightedCount)
    const lastPart = idChildren.slice(idChildren.length - highlightedCount)
    const dimConfig = highlightModes?.[mode] || highlightModes?.default

    return (
      <>
        <span
          className={`Identifier__Symbols ${!dimConfig?.first ? 'Identifier__Symbols--Dim' : ''}`}
        >
          {firstPart}
        </span>
        <span
          className={`Identifier__Symbols ${!dimConfig?.middle ? 'Identifier__Symbols--Dim' : ''}`}
        >
          {middlePart}
        </span>
        <span
          className={`Identifier__Symbols ${!dimConfig?.last ? 'Identifier__Symbols--Dim' : ''}`}
        >
          {lastPart}
        </span>
      </>
    )
  }

  return (
    <div
      className={`Identifier ${ellipsis && !middleEllipsis ? 'Identifier--Ellipsis' : ''} ${middleEllipsis ? 'Identifier--Middle' : ''} ${linesAdjustment && !ellipsis && !middleEllipsis ? 'Identifier--Balanced' : ''} ${className || ''}`}
    >
      {avatar && children && (
        <ImageGenerator
          className={'Identifier__Avatar'}
          username={typeof children === 'string' ? children : String(children)}
          lightness={50}
          saturation={50}
          width={24}
          height={24}
        />
      )}
      <div
        className={'Identifier__SymbolsContainer'}
        ref={symbolsContainerRef}
        title={typeof children === 'string' ? children : undefined}
      >
        {children && middleEllipsis ? (
          <MiddleTruncated>{children}</MiddleTruncated>
        ) : children && highlightMode ? (
          <HighlightedID mode={highlightMode}>{children}</HighlightedID>
        ) : (
          children || <NotActive />
        )}
      </div>
      {copyButton && children && (
        <CopyButton className={'Identifier__CopyButton'} text={String(children)} />
      )}
    </div>
  )
}
