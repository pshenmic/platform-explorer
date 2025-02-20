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
    ref: ref,
    handler: () => setIsOpen(false)
  })

  const element = cloneElement(children, {
    ref: ref,
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
      // borderRadius={'10px'}
      // border={'4px solid'}
      // borderColor={'gray.750'}
      // background={'gray.675'}
      // borderLeft={'none'}
      // borderRight={'none'}
      // padding={'18px 24px'}
      isOpen={isOpen || isHovered}
      onClose={() => setIsOpen(false)}
      {...props}
    >
      {element}
    </ChakraTooltip>
  )
}
