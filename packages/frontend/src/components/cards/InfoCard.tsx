'use client'

import { useState, createRef, forwardRef } from 'react'
import type { MouseEvent, ForwardedRef } from 'react'
import Link from 'next/link'
import type { WithChildren, WithClassName } from '../../types/common'
import './InfoCard.scss'

interface WrapperProps extends WithChildren, WithClassName {
  link?: string
  onMouseMove?: (e: MouseEvent) => void
}

const Wrapper = forwardRef(function Wrapper (props: WrapperProps, ref: ForwardedRef<HTMLAnchorElement | HTMLDivElement>) {
  return props?.link
    ? <Link ref={ref as ForwardedRef<HTMLAnchorElement>} onMouseMove={props.onMouseMove} href={props.link} className={props.className}>{props.children}</Link>
    : <div ref={ref as ForwardedRef<HTMLDivElement>} onMouseMove={props.onMouseMove} className={props.className}>{props.children}</div>
})

interface InfoCardProps extends WithChildren, WithClassName {
  clickable?: boolean
  link?: string
  loading?: boolean
}

export default function InfoCard ({ clickable, link, loading, children, className }: InfoCardProps) {
  const card = createRef<HTMLAnchorElement | HTMLDivElement>()
  const [mousePosition, setMousePosition] = useState<{ x?: number, y?: number }>({})

  const mouseMoveHandler = (e: MouseEvent) => {
    const native = e.nativeEvent as MouseEvent['nativeEvent'] & { layerX: number, layerY: number }
    setMousePosition({
      x: native.layerX,
      y: native.layerY
    })
  }

  return (
    <Wrapper
      ref={card}
      onMouseMove={mouseMoveHandler}
      className={`InfoCard ${className ?? ''} ${(clickable || link) ? 'InfoCard--Clickable' : ''} ${loading ? 'InfoCard--Loading' : ''}`}
      link={link}
    >
      {children}
      <div className={'InfoCard__LoadingStub'}></div>
      <div style={{ left: mousePosition.x, top: mousePosition.y }} className={'InfoCard__HoverBg'}></div>
    </Wrapper>
  )
}
