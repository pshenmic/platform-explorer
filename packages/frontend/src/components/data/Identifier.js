'use client'

import ImageGenerator from '../imageGenerator'
import { CopyButton } from '../ui/Buttons'
import { useRef, useState, useEffect, useCallback } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import NotActive from './NotActive'
import { useDebounce } from '../../hooks'
import './Identifier.scss'

export default function Identifier ({
  children,
  ellipsis = true,
  avatar,
  styles = [],
  copyButton,
  linesAdjustment = true,
  className
}) {
  const symbolsContainerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [charWidth, setCharWidth] = useState(0)
  const [linesMaxWidth, setLinesMaxWidth] = useState('none')
  const [widthIsCounted, setWidthIsCounted] = useState(false)
  const prevWidthRef = useRef(null)
  const [windowWidth, setWindowWidth] = useState(0)
  const debouncedWindowWidth = useDebounce(windowWidth, 500)

  if (ellipsis) linesAdjustment = false

  useResizeObserver(symbolsContainerRef, (entry) => {
    setContainerWidth(entry.contentRect.width)
  })

  const updateSize = () => {
    if (widthIsCounted) return

    const charCount = children?.length

    if (!charWidth || !containerWidth || !charCount) {
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
  }, [charWidth, containerWidth, debouncedWindowWidth])

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
  }, [])

  const measureCharWidth = useCallback(() => {
    if (!symbolsContainerRef.current || !linesAdjustment) return 0

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
  }, [linesAdjustment])

  useEffect(() => {
    if (!symbolsContainerRef.current || !linesAdjustment) return

    setCharWidth(measureCharWidth() || 'auto')
  }, [])

  const highlightMode = (() => {
    if (styles.includes('dim')) return 'dim'
    if (styles.includes('highlight-first')) return 'first'
    if (styles.includes('highlight-last')) return 'last'
    if (styles.includes('highlight-both')) return 'both'
    return null
  })()

  const HighlightedID = ({ children, mode }) => {
    if (!children || typeof children !== 'string') return <NotActive/>

    const highlightedCount = 5
    const firstPart = children.slice(0, highlightedCount)
    const middlePart = children.slice(highlightedCount, children.length - highlightedCount)
    const lastPart = children.slice(children.length - highlightedCount)

    return (
      <>
        <span className={`Identifier__Symbols ${mode === 'last' || mode === 'dim' ? 'Identifier__Symbols--Dim' : ''}`}>{firstPart}</span>
        <span className={'Identifier__Symbols Identifier__Symbols--Dim'}>{middlePart}</span>
        <span className={`Identifier__Symbols ${mode === 'first' || mode === 'dim' ? 'Identifier__Symbols--Dim' : ''}`}>{lastPart}</span>
      </>
    )
  }

  return (
    <div className={`Identifier ${ellipsis ? 'Identifier--Ellipsis' : ''} ${className || ''}`}>
      {avatar && children && (
        <ImageGenerator className={'Identifier__Avatar'} username={children} lightness={50} saturation={50} width={24} height={24} />
      )}
      <div
        className={'Identifier__SymbolsContainer'}
        style={{ maxWidth: widthIsCounted ? linesMaxWidth : 'none' }}
        ref={symbolsContainerRef}
      >
        {children && highlightMode
          ? <HighlightedID mode={highlightMode}>{children}</HighlightedID>
          : children || <NotActive/>
        }
      </div>
      {copyButton && children && <CopyButton className={'Identifier__CopyButton'} text={children}/>}
    </div>
  )
}
