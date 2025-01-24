'use client'

import { useState, useRef } from 'react'
import useResizeObserver from '@react-hook/resize-observer'

const SmoothSize = ({ className, children, duration = 0.3, smoothHeight = true, smoothWidth = false, easing = 'ease' }) => {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useResizeObserver(containerRef, (entry) => {
    const { width, height } = entry.contentRect
    setDimensions({ width, height })
  })

  return (
    <div
      className={`SmoothSize ${className || ''}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        transition: `width ${duration}s ${easing}, height ${duration}s ${easing}`,
        width: smoothWidth ? `${dimensions.width}px` : 'auto',
        height: smoothHeight ? `${dimensions.height}px` : 'auto'
      }}
    >
      <div ref={containerRef}>
        {children}
      </div>
    </div>
  )
}

export default SmoothSize
