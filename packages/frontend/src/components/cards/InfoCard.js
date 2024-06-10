'use client'

import { useState, createRef } from 'react'
import './InfoCard.scss'

export default function InfoCard ({ clickable, loading, children, className }) {
  const card = createRef()
  const [mousePosition, setMousePosition] = useState({})

  const mouseMoveHandler = (e) => setMousePosition({
    x: e.nativeEvent.layerX,
    y: e.nativeEvent.layerY
  })

  return (
    <div
      ref={card}
      onMouseMove={mouseMoveHandler}
      className={`InfoCard ${className} ${clickable ? 'InfoCard--Clickable' : ''} ${loading ? 'InfoCard--Loading' : ''}`}
    >
        {children}
        <div style={{ left: mousePosition.x, top: mousePosition.y }} className={'InfoCard__HoverBg'}></div>
    </div>
  )
}
