'use client'

import ImageGenerator from '../imageGenerator'
import { CopyButton } from '../ui/Buttons'
import { useRef, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import type { WithChildren, WithClassName } from '../../types/common'
import NotActive from './NotActive'
import { useDebounce } from '../../hooks'
import './Identifier.css'

type HighlightStyle = 'dim' | 'highlight' | 'highlight-first' | 'highlight-last' | 'highlight-both' | string
type HighlightMode = 'dim' | 'highlight' | 'first' | 'last' | 'both' | 'default'

interface IdentifierProps extends WithChildren, WithClassName {
  ellipsis?: boolean
  middleEllipsis?: boolean
  avatar?: boolean
  styles?: HighlightStyle[]
  copyButton?: boolean
  linesAdjustment?: boolean
}

export default function Identifier ({
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
  const [charWidth, setCharWidth] = useState<number | 'auto'>(0)
  const [linesMaxWidth, setLinesMaxWidth] = useState<string | number>('none')
  const [widthIsCounted, setWidthIsCounted] = useState(false)
  const prevWidthRef = useRef<number | null>(null)
  const [windowWidth, setWindowWidth] = useState(0)
  const debouncedWindowWidth = useDebounce(windowWidth, 500)

  if (ellipsis || middleEllipsis) linesAdjustment = false

  useResizeObserver(symbolsContainerRef as never, (entry) => {
    setContainerWidth(entry.contentRect.width)
  })

  const updateSize = () => {
    if (widthIsCounted) return

    const charCount = typeof children === 'string' ? children.length : 0

    if (!charWidth || charWidth === 'auto' || !containerWidth || !charCount) {
      setLinesMaxWidth('none')
      return
    }

    const lineWidthAdjustment = 0.7
    const charSpacingFactor = 0.1625
    const charsPerLine = Math.floor((containerWidth / charWidth) + charSpacingFactor)

    if (charsPerLine <= charCount / 8 || charsPerLine > charCount) {
      setLinesMaxWidth('none')
      return
    }

    const linesCount = Math.max(Math.ceil(charCount / charsPerLine), 1)
    const lineWidth = charWidth * (charCount / linesCount + lineWidthAdjustment)

    setLinesMaxWidth(`${lineWidth}px`)
    setWidthIsCounted(true)
  }

  useEffect(() => {
    if (!linesAdjustment) return

    if (debouncedWindowWidth !== prevWidthRef.current || !widthIsCounted || prevWidthRef.current === null) {
      updateSize()
    }
    prevWidthRef.current = debouncedWindowWidth
  }, [charWidth, containerWidth, debouncedWindowWidth, linesAdjustment, widthIsCounted])

  useEffect(() => {
    if (!linesAdjustment) return

    let prevWidth = window.innerWidth

    const resizeHandler = () => {
      const currentWidth = window.innerWidth

      if (currentWidth !== prevWidth) {
        setWindowWidth(currentWidth)
        setWidthIsCounted(false)
        prevWidth = currentWidth
      }
    }

    window.addEventListener('resize', resizeHandler)
    return () => window.removeEventListener('resize', resizeHandler)
  }, [linesAdjustment])

  const measureCharWidth = useCallback(() => {
    if (!symbolsContainerRef.current || !(linesAdjustment || middleEllipsis)) return 0

    const tempElement = document.createElement('span')
    const parentStyles = window.getComputedStyle(symbolsContainerRef.current)

    tempElement.style.position = 'absolute'
    tempElement.style.visibility = 'hidden'
    tempElement.style.fontFamily = parentStyles?.fontFamily || 'monospace'
    tempElement.style.fontSize = parentStyles?.fontSize || '0.75rem'
    tempElement.style.fontWeight = parentStyles?.fontWeight || 'normal'
    tempElement.innerText = 'A'

    document.body.appendChild(tempElement)
    const width = tempElement?.getBoundingClientRect()?.width || 0
    document.body.removeChild(tempElement)

    return width
  }, [linesAdjustment, middleEllipsis])

  useEffect(() => {
    if (!symbolsContainerRef.current || !(linesAdjustment || middleEllipsis)) return

    setCharWidth(measureCharWidth() || 'auto')
  }, [measureCharWidth, linesAdjustment, middleEllipsis])

  const highlightModes: Record<HighlightMode, { first: boolean, middle: boolean, last: boolean }> = {
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
    if (!middleChildren || typeof middleChildren !== 'string') return <NotActive/>

    const minEdge = 4
    const measured = charWidth && charWidth !== 'auto' && containerWidth
    const maxChars = measured ? Math.floor(containerWidth / (charWidth as number)) : minEdge * 2 + 1

    if (maxChars >= middleChildren.length) return <>{middleChildren}</>

    const keep = Math.max(maxChars - 1, minEdge * 2)
    const head = Math.max(Math.ceil(keep / 2), minEdge)
    const tail = Math.max(Math.floor(keep / 2), minEdge)

    if (head + tail >= middleChildren.length) return <>{middleChildren}</>

    return <>{`${middleChildren.slice(0, head)}…${middleChildren.slice(-tail)}`}</>
  }

  const HighlightedID = ({ children: idChildren, mode }: { children?: ReactNode, mode: HighlightMode }) => {
    if (!idChildren || typeof idChildren !== 'string') return <NotActive/>

    const highlightedCount = 5
    const firstPart = idChildren.slice(0, highlightedCount)
    const middlePart = idChildren.slice(highlightedCount, idChildren.length - highlightedCount)
    const lastPart = idChildren.slice(idChildren.length - highlightedCount)
    const dimConfig = highlightModes?.[mode] || highlightModes?.default

    return (
      <>
        <span className={`Identifier__Symbols ${!dimConfig?.first ? 'Identifier__Symbols--Dim' : ''}`}>{firstPart}</span>
        <span className={`Identifier__Symbols ${!dimConfig?.middle ? 'Identifier__Symbols--Dim' : ''}`}>{middlePart}</span>
        <span className={`Identifier__Symbols ${!dimConfig?.last ? 'Identifier__Symbols--Dim' : ''}`}>{lastPart}</span>
      </>
    )
  }

  return (
    <div className={`Identifier ${ellipsis && !middleEllipsis ? 'Identifier--Ellipsis' : ''} ${middleEllipsis ? 'Identifier--Middle' : ''} ${className || ''}`}>
      {avatar && children && (
        <ImageGenerator className={'Identifier__Avatar'} username={typeof children === 'string' ? children : String(children)} lightness={50} saturation={50} width={24} height={24} />
      )}
      <div
        className={'Identifier__SymbolsContainer'}
        style={{ maxWidth: widthIsCounted ? linesMaxWidth : 'none' }}
        ref={symbolsContainerRef}
        title={middleEllipsis && typeof children === 'string' ? children : undefined}
      >
        {children && middleEllipsis
          ? <MiddleTruncated>{children}</MiddleTruncated>
          : children && highlightMode
            ? <HighlightedID mode={highlightMode}>{children}</HighlightedID>
            : children || <NotActive/>
        }
      </div>
      {copyButton && children && <CopyButton className={'Identifier__CopyButton'} text={String(children)}/>}
    </div>
  )
}
