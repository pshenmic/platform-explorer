'use client'

import ImageGenerator from '../imageGenerator'
import { CopyButton } from '../ui/Buttons'
import { useRef, useState, useEffect } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import './Identifier.scss'

export default function Identifier ({ children, ellipsis = true, avatar, styles = [], copyButton, className }) {
  const symbolsContainerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [charWidth, setCharWidth] = useState(0)
  const [symbolsWidth, setSymbolsWidth] = useState('auto')
  const [widthIsCounted, setWidthIsCounted] = useState(false)

  useResizeObserver(symbolsContainerRef, (entry) => {
    setContainerWidth(entry.contentRect.width)
  })

  const updateSize = () => {
    setWidthIsCounted(true)

    const charCount = children?.length

    if (!charWidth || !containerWidth || !charCount) {
      setSymbolsWidth('auto')
      return
    }

    const charsPerLine = Math.floor((containerWidth / charWidth) + 0.1625)

    if (charsPerLine <= charCount / 8 || charsPerLine > charCount) {
      setSymbolsWidth('auto')
      return
    }

    const linesCount = Math.max(Math.ceil(charCount / charsPerLine), 1)
    const lineWidth = charCount * charWidth / linesCount

    setSymbolsWidth(`${lineWidth + charWidth / 2}px`)
  }

  useEffect(() => {
    updateSize()
  }, [charWidth, containerWidth, widthIsCounted])

  useEffect(() => {
    const resizeHandler = () => {
      setWidthIsCounted(false)
    }
    window.addEventListener('resize', resizeHandler)
    return () => window.removeEventListener('resize', resizeHandler)
  }, [])

  useEffect(() => {
    if (!symbolsContainerRef.current) return

    const tempElement = document.createElement('span')
    tempElement.style.position = 'absolute'
    tempElement.style.visibility = 'hidden'
    tempElement.style.fontSize = '0.75rem'
    tempElement.style.whiteSpace = 'nowrap'
    tempElement.style.fontFamily = 'monospace'
    tempElement.innerText = 'A'
    document.body.appendChild(tempElement)
    const width = tempElement?.getBoundingClientRect()?.width
    setCharWidth(width || 'auto')
  }, [])

  const highlightMode = (() => {
    if (styles.includes('dim')) return 'dim'
    if (styles.includes('highlight-first')) return 'first'
    if (styles.includes('highlight-last')) return 'last'
    if (styles.includes('highlight-both')) return 'both'
    return null
  })()

  const sizeClass = (() => {
    if (styles.includes('size-32')) return 'Identifier--Size32'
    if (styles.includes('size-43')) return 'Identifier--Size44'
    if (styles.includes('size-44')) return 'Identifier--Size44'
    if (styles.includes('size-64')) return 'Identifier--Size64'
    return ''
  })()

  const HighlightedID = ({ children, mode }) => {
    if (!children || typeof children !== 'string') return <span>n/a</span>

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
    <div
      className={`Identifier ${sizeClass} ${ellipsis ? 'Identifier--Ellipsis' : ''} ${className || ''}`}
      style={{ width: '100%', maxWidth: '100%' }}
    >
      {avatar && children && (
        <ImageGenerator className={'Identifier__Avatar'} username={children} lightness={50} saturation={50} width={24} height={24} />
      )}
      <div
        className={'Identifier__SymbolsContainer'}
        style={{
          width: '100%',
          maxWidth: widthIsCounted ? symbolsWidth : 'none'
        }}
        ref={symbolsContainerRef}
      >
        {children && highlightMode
          ? <HighlightedID mode={highlightMode}>{children}</HighlightedID>
          : children || 'n/a'
        }
      </div>
      {copyButton && children && <CopyButton className={'Identifier__CopyButton'} text={children}/>}
    </div>
  )
}
