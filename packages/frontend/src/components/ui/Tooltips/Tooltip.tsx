'use client'

import { useOutsideClick } from '../../../hooks/useOutsideClick'
import { Tooltip as ChakraTooltip } from '@chakra-ui/react'
import type { TooltipProps as ChakraTooltipProps } from '@chakra-ui/react'
import { useState, useRef, useEffect, cloneElement, isValidElement } from 'react'
import type { ReactElement, ReactNode, MouseEvent, Ref } from 'react'
import type { WithClassName } from '../../../types/common'
import './Tooltip.css'

type TooltipChildProps = {
  ref?: Ref<HTMLElement>
  onMouseEnter?: (e: MouseEvent) => void
  onMouseLeave?: (e: MouseEvent) => void
  onClick?: (e: MouseEvent) => void
}

interface TooltipProps
  extends WithClassName,
    Omit<ChakraTooltipProps, 'children' | 'label' | 'className' | 'title' | 'content'> {
  title?: ReactNode
  content?: ReactNode
  label?: ReactNode
  // React 19: child element props are unknown; keep loose element type
  children: ReactElement
}

// Interactive-friendly tooltip: delayed close so the pointer can move from the
// trigger into the tip body (links, richer content) without the tip vanishing.
export default function Tooltip({
  title = '',
  content = '',
  children,
  className,
  label,
  ...props
}: TooltipProps) {
  const extraClass = title && content ? 'Tooltip--Extended' : ''
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLElement | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useOutsideClick({
    ref,
    handler: () => setIsOpen(false)
  })

  useEffect(
    () => () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current)
    },
    []
  )

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

  const childProps = (isValidElement(children) ? children.props : {}) as TooltipChildProps

  const element = isValidElement(children)
    ? cloneElement(children as ReactElement<TooltipChildProps>, {
        ref,
        onMouseEnter: (e: MouseEvent) => {
          childProps.onMouseEnter?.(e)
          hoverIn()
        },
        onMouseLeave: (e: MouseEvent) => {
          childProps.onMouseLeave?.(e)
          hoverOut()
        },
        onClick: (e: MouseEvent) => {
          childProps.onClick?.(e)
          setIsOpen(prev => !prev)
        }
      })
    : children

  const resolvedLabel = label ?? (
    <div className={'Tooltip__Body'} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
      {title ? <div className={'Tooltip__Title'}>{title}</div> : null}
      <div className={'Tooltip__Content'}>{content}</div>
    </div>
  )

  return (
    <ChakraTooltip
      className={`Tooltip ${extraClass}${className ? ` ${className}` : ''}`}
      label={resolvedLabel}
      isOpen={isOpen || isHovered}
      onClose={() => setIsOpen(false)}
      closeOnClick={false}
      openDelay={0}
      closeDelay={0}
      gutter={8}
      // keep tips inside the viewport on phones; avoid 100vw (scrollbar width → h-scroll)
      maxW={'18rem'}
      modifiers={[
        {
          name: 'preventOverflow',
          options: { padding: 12, altAxis: true, tether: false }
        },
        {
          name: 'flip',
          options: { fallbackPlacements: ['bottom', 'top', 'left', 'right'] }
        }
      ]}
      {...props}
    >
      {element}
    </ChakraTooltip>
  )
}
