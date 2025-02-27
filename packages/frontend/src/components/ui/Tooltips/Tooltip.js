'use client'

import { Tooltip as ChakraTooltip, useOutsideClick } from '@chakra-ui/react'
import { useState, useRef, cloneElement } from 'react'
import './Tooltip.scss'

export default function Tooltip ({ title = '', content = '', children, className, ...props }) {
  const extraClass = title && content ? 'Tooltip--Extended' : ''
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef()

  useOutsideClick({
    ref,
    handler: () => setIsOpen(false)
  })

  const element = cloneElement(children, {
    ref,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onClick: () => setIsOpen(prev => !prev)
  })

  return (
    <ChakraTooltip
      className={`Tooltip ${extraClass}`}
      label={
        <div>
          <div className={'Tooltip__Title'}>{title}</div>
          <div className={'Tooltip__Content'}>{content}</div>
        </div>
      }
      isOpen={isOpen || isHovered}
      onClose={() => setIsOpen(false)}
      {...props}
    >
      {element}
    </ChakraTooltip>
  )
}
