'use client'

import { Tooltip as ChakraTooltip, useOutsideClick } from '@chakra-ui/react'
import { useState, useRef, useEffect, cloneElement } from 'react'
import './Tooltip.scss'

// Interactive-friendly tooltip: delayed close so the pointer can move from the
// trigger into the tip body (links, richer content) without the tip vanishing.
export default function Tooltip ({ title = '', content = '', children, className, ...props }) {
  const extraClass = title && content ? 'Tooltip--Extended' : ''
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef()
  const leaveTimer = useRef(null)

  useOutsideClick({
    ref,
    handler: () => setIsOpen(false)
  })

  useEffect(() => () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
  }, [])

  const clearLeave = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current)
      leaveTimer.current = null
    }
  }

  const hoverIn = () => {
    clearLeave()
    setIsHovered(true)
  }

  // grace period to cross the gap between trigger and portal tip
  const hoverOut = () => {
    clearLeave()
    leaveTimer.current = setTimeout(() => setIsHovered(false), 280)
  }

  const element = cloneElement(children, {
    ref,
    onMouseEnter: (e) => {
      children.props?.onMouseEnter?.(e)
      hoverIn()
    },
    onMouseLeave: (e) => {
      children.props?.onMouseLeave?.(e)
      hoverOut()
    },
    onClick: (e) => {
      children.props?.onClick?.(e)
      setIsOpen(prev => !prev)
    }
  })

  return (
    <ChakraTooltip
      className={`Tooltip ${extraClass}${className ? ` ${className}` : ''}`}
      label={
        <div
          className={'Tooltip__Body'}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
        >
          {title ? <div className={'Tooltip__Title'}>{title}</div> : null}
          <div className={'Tooltip__Content'}>{content}</div>
        </div>
      }
      isOpen={isOpen || isHovered}
      onClose={() => setIsOpen(false)}
      closeOnClick={false}
      openDelay={0}
      closeDelay={0}
      gutter={8}
      {...props}
    >
      {element}
    </ChakraTooltip>
  )
}
