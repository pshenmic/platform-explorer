'use client'

import { useEffect, useRef, useState } from 'react'
import type { WithClassName } from '../../types/common'
import { CopyButton } from '../ui/Buttons'
import { SmoothSize } from '../ui/containers'
import './CodeBlock.css'

interface CodeBlockProps extends WithClassName {
  code?: string | null
  smoothSize?: boolean
}

function CodeBlock({ code, smoothSize = true, className = '' }: CodeBlockProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [fullSize, setFullSize] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const parsedCode = code ? JSON.stringify(JSON.parse(code), null, 2) : ''
  const codeContainerRef = useRef<HTMLPreElement | null>(null)
  const codeRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    if (!smoothSize) setIsAnimating(false)
    else timer = setTimeout(() => setIsAnimating(true), 10)
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [smoothSize])

  useEffect(() => {
    const container = codeContainerRef?.current
    const codeEl = codeRef?.current

    const checkOverflow = () => {
      if (container && codeEl) {
        setIsOverflowing(codeEl.clientHeight > container.clientHeight)
      }
    }

    const observer = new ResizeObserver(checkOverflow)
    if (container) observer.observe(container)
    if (codeEl) observer.observe(codeEl)

    checkOverflow()

    return () => {
      if (observer) observer.disconnect()
    }
  }, [])

  return (
    <div className={`CodeBlock ${className || ''}`}>
      <div className={'CodeBlock__CodeContainer'}>
        <SmoothSize smoothHeight={isAnimating}>
          <pre
            className={`CodeBlock__Code ${fullSize ? 'CodeBlock__Code--FullSize' : ''}`}
            ref={codeContainerRef}
          >
            <div ref={codeRef}>{parsedCode}</div>
          </pre>
        </SmoothSize>

        <CopyButton className={'CodeBlock__CopyButton'} text={parsedCode} />
      </div>

      {(isOverflowing || fullSize) && (
        <button
          type={'button'}
          onClick={() => setFullSize(state => !state)}
          className={'CodeBlock__FullSizeButton'}
        >
          {fullSize ? 'Hide code' : 'Show full code'}
        </button>
      )}
    </div>
  )
}

export default CodeBlock
