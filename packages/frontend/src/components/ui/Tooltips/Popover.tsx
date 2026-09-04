'use client'

import { useOutsideClick } from '../../../hooks/useOutsideClick'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { WithChildren, WithClassName } from '../../../types/common'

type Placement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'

interface CustomPopoverProps extends WithChildren, WithClassName {
  trigger?: ReactNode
  header?: ReactNode
  placement?: Placement | string
  closeOnBlur?: boolean
  hasArrow?: boolean
  showCloseButton?: boolean
  popoverProps?: Record<string, unknown>
  contentProps?: { className?: string; style?: CSSProperties; [key: string]: unknown }
  stateCallback?: (isOpen: boolean) => void
}

const GUTTER = 8
const VIEW_PAD = 12

function place(rect: DOMRect, placement: string, w: number, h: number): CSSProperties {
  const cx = rect.left + rect.width / 2
  let top = rect.bottom + GUTTER
  let left = cx
  let transform = 'translateX(-50%)'
  const p = placement || 'bottom'

  if (p.startsWith('top')) {
    top = rect.top - GUTTER
    transform = 'translate(-50%, -100%)'
  } else if (p.startsWith('bottom')) {
    top = rect.bottom + GUTTER
    transform = 'translateX(-50%)'
  } else if (p === 'left') {
    top = rect.top + rect.height / 2
    left = rect.left - GUTTER
    transform = 'translate(-100%, -50%)'
  } else if (p === 'right') {
    top = rect.top + rect.height / 2
    left = rect.right + GUTTER
    transform = 'translate(0, -50%)'
  }

  if (p.endsWith('-start')) {
    left = rect.left
    transform = p.startsWith('top') ? 'translateY(-100%)' : 'none'
  } else if (p.endsWith('-end')) {
    left = rect.right
    transform = p.startsWith('top') ? 'translate(-100%, -100%)' : 'translateX(-100%)'
  }

  left = Math.min(Math.max(left, VIEW_PAD), window.innerWidth - VIEW_PAD)
  top = Math.min(Math.max(top, VIEW_PAD), window.innerHeight - VIEW_PAD - Math.min(h, 40))
  void w
  return { position: 'fixed', top, left, transform, zIndex: 1500 }
}

const contentLook: CSSProperties = {
  fontFamily: 'var(--pe-font-heading)',
  fontSize: '0.688rem',
  gap: '0.5rem',
  padding: '1rem 1.25rem',
  background: '#3E4A4F',
  color: '#fff',
  borderRadius: 10,
  borderTop: '4px solid #72787B4D',
  borderBottom: '4px solid #181F23',
  borderLeft: 'none',
  borderRight: 'none',
  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)'
}

const CustomPopover = ({
  trigger,
  header,
  children,
  placement = 'bottom',
  closeOnBlur = true,
  hasArrow = false,
  showCloseButton = false,
  popoverProps = {},
  contentProps = {},
  stateCallback,
  className
}: CustomPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState<CSSProperties>({})
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const onClose = useCallback(() => setIsOpen(false), [])
  const handleToggle = () => setIsOpen(open => !open)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    typeof stateCallback === 'function' && stateCallback(isOpen)
  }, [isOpen, stateCallback])

  const updatePos = useCallback(() => {
    const el = triggerRef.current
    const panel = popoverRef.current
    if (!el || !panel) return
    setPos(place(el.getBoundingClientRect(), String(placement), panel.offsetWidth, panel.offsetHeight))
  }, [placement])

  useLayoutEffect(() => {
    if (!isOpen) return undefined
    updatePos()
    const onScroll = () => updatePos()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [isOpen, updatePos])

  useOutsideClick({
    ref: popoverRef,
    enabled: closeOnBlur && isOpen,
    handler: event => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target)) return
      onClose()
    }
  })

  const { className: contentClass, style: contentStyle, ...restContent } = contentProps
  void popoverProps
  void restContent

  const panel =
    isOpen && mounted
      ? createPortal(
          <div
            ref={popoverRef}
            className={`Popover__Content ${className || ''} ${contentClass || ''}`}
            style={{ ...contentLook, ...pos, ...contentStyle }}
            role="dialog"
          >
            {hasArrow ? <div className={'Popover__Arrow'} aria-hidden /> : null}
            {showCloseButton ? (
              <button type="button" className={'Popover__Close'} onClick={onClose} aria-label="Close">
                ×
              </button>
            ) : null}
            {header ? (
              <div
                className={'Popover__Header'}
                style={{ padding: 0, borderBottom: 0, textAlign: 'left', fontWeight: 700, fontSize: '0.75rem' }}
              >
                {header}
              </div>
            ) : null}
            <div className={'Popover__Body'} style={{ fontFamily: 'var(--pe-font-mono)', padding: 0 }}>
              {children}
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <>
      <div ref={triggerRef} onClick={handleToggle} style={{ display: 'inline-block' }}>
        {trigger}
      </div>
      {panel}
    </>
  )
}

export default CustomPopover
