'use client'

import { useState, createRef, forwardRef } from 'react'
import Link from 'next/link'
import './InfoCard.scss'

const Wrapper = forwardRef(function Wrapper (props, ref) {
  return props?.link
    ? <Link ref={ref} onMouseMove={props.onMouseMove} href={props.link} className={props.className}>{props.children}</Link>
    : <div ref={ref} onMouseMove={props.onMouseMove} className={props.className}>{props.children}</div>
})

export default function InfoCard ({ clickable, link, loading, children, className }) {
  const card = createRef()
  const [mousePosition, setMousePosition] = useState({})

  const mouseMoveHandler = (e) => setMousePosition({
    x: e.nativeEvent.layerX,
    y: e.nativeEvent.layerY
  })

  return (
    <Wrapper
      ref={card}
      onMouseMove={mouseMoveHandler}
      className={`InfoCard ${className} ${(clickable || link) ? 'InfoCard--Clickable' : ''} ${loading ? 'InfoCard--Loading' : ''}`}
      link={link}
    >
      {children}
      <div className={'InfoCard__LoadingStub'}></div>
      <div style={{ left: mousePosition.x, top: mousePosition.y }} className={'InfoCard__HoverBg'}></div>
    </Wrapper>
  )
}
