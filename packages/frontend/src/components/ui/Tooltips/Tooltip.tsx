'use client'

import {
  useState,
  useRef,
  useEffect,
  useId,
  useLayoutEffect,
  useCallback,
  cloneElement,
  isValidElement
} from 'react'
import type { MouseEvent, ReactElement, ReactNode, Ref } from 'react'
import { createPortal } from 'react-dom'
import { useOutsideClick } from '@chakra-ui/react'
import { useTooltipActive } from 'src/contexts/TooltipProvider'
import './Tooltip.css'

const LEAVE_GRACE_MS = 280
const GUTTER = 8
const VIEW_PAD = 12

type TipPos = { top: number, left: number, transform: string, placement: string }

function placeFixed (rect: DOMRect, placement: string, tipW = 240, tipH = 80): TipPos {
  const cx = rect.left + rect.width / 2
  let next = placement || 'top'

  if (next === 'top' && rect.top < tipH + GUTTER + VIEW_PAD) next = 'bottom'
  if (next === 'bottom' && window.innerHeight - rect.bottom < tipH + GUTTER + VIEW_PAD) next = 'top'

  let top
  let left = cx
  let transform

  if (next === 'bottom') {
    top = rect.bottom + GUTTER
    transform = 'translate(-50%, 0)'
  } else {
    top = rect.top - GUTTER
    transform = 'translate(-50%, -100%)'
  }

  // horizontal: keep tip in viewport without slamming to 0 when possible
  const half = tipW / 2
  const minCenter = VIEW_PAD + half
  const maxCenter = window.innerWidth - VIEW_PAD - half
  if (maxCenter > minCenter) {
    left = Math.min(maxCenter, Math.max(minCenter, left))
  } else {
    left = window.innerWidth / 2
  }

  return { top, left, transform, placement: next }
}

// Fixed-position tip (no Chakra Popper). asChild keeps grid/flex layout intact.
// Accepts legacy Chakra-style props (label, isOpen, isDisabled, bg, …) for call-site compat.
interface TooltipProps {
  title?: ReactNode
  content?: ReactNode
  label?: ReactNode
  children?: ReactNode
  className?: string
  placement?: string
  asChild?: boolean
  isOpen?: boolean
  isDisabled?: boolean
  [key: string]: unknown
}

export default function Tooltip ({
  title = '',
  content = '',
  label,
  children,
  className = '',
  placement = 'top',
  asChild = true,
  isOpen: isOpenProp,
  isDisabled = false,
  ..._legacy
}: TooltipProps) {
  // label is Chakra-era alias for content
  const body = content || label || ''
  const extraClass = title && body ? 'Tooltip--Extended' : ''
  const id = useId()
  const active = useTooltipActive()
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pos, setPos] = useState<TipPos | null>(null)
  const pinnedRef = useRef(false)
  const triggerRef = useRef<HTMLElement | null>(null)
  const tipRef = useRef<HTMLDivElement | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mounted, setMounted] = useState(false)

  const isMine = !active || active.activeId === id
  // controlled isOpen (CopyButton) wins over hover/pin; isDisabled forces closed
  const openByInteraction = pinned || hovered
  const openByProp = typeof isOpenProp === 'boolean' ? isOpenProp : openByInteraction
  const isOpen = !isDisabled && isMine && openByProp

  useEffect(() => { setMounted(true) }, [])

  const clearLeave = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current)
      leaveTimer.current = null
    }
  }

  const release = useCallback(() => {
    clearLeave()
    setHovered(false)
    setPinned(false)
    pinnedRef.current = false
    setPos(null)
    active?.deactivate(id)
  }, [active, id])

  const updatePos = useCallback(() => {
    const el = triggerRef.current
    const tipEl = tipRef.current as HTMLElement | null
    if (!el || !tipEl) return
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return
    const tipR = tipEl.getBoundingClientRect()
    if (tipR.width === 0 && tipR.height === 0) return
    setPos(placeFixed(rect, placement, tipR.width, tipR.height))
  }, [placement])

  useLayoutEffect(() => {
    if (!isOpen) {
      setPos(null)
      return undefined
    }
    updatePos()
    const raf = requestAnimationFrame(() => updatePos())
    const onScroll = () => updatePos()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [isOpen, updatePos, title, body])

  useOutsideClick({
    ref: triggerRef,
    handler: (e) => {
      if (!pinnedRef.current) return
      if (tipRef.current?.contains(e.target as Node | null)) return
      release()
    }
  })

  useEffect(() => () => {
    clearLeave()
    active?.deactivate(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (active && active.activeId != null && active.activeId !== id) {
      clearLeave()
      setHovered(false)
      setPinned(false)
      pinnedRef.current = false
      setPos(null)
    }
  }, [active?.activeId, id, active])

  const hoverIn = () => {
    clearLeave()
    setHovered(true)
    active?.activate(id)
  }

  const hoverOut = () => {
    clearLeave()
    leaveTimer.current = setTimeout(() => {
      setHovered(false)
      if (!pinnedRef.current) {
        active?.deactivate(id)
        setPos(null)
      }
    }, LEAVE_GRACE_MS)
  }

  const onTriggerClick = (e: MouseEvent) => {
    if (e.target !== e.currentTarget && (e.target as HTMLElement).closest?.('a, button, [role="link"]')) return
    const next = !pinnedRef.current
    pinnedRef.current = next
    clearLeave()
    setPinned(next)
    if (next) {
      setHovered(true)
      active?.activate(id)
    } else {
      setHovered(false)
      setPos(null)
      active?.deactivate(id)
    }
  }

  const setTriggerNode = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node
  }, [])

  let trigger
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{
      onMouseEnter?: (e: MouseEvent) => void
      onMouseLeave?: (e: MouseEvent) => void
      onClick?: (e: MouseEvent) => void
    }> & { ref?: Ref<HTMLElement> }
    trigger = cloneElement(child, {
      ref: (node: HTMLElement | null) => {
        setTriggerNode(node)
        const r = child.ref
        if (typeof r === 'function') r(node)
        else if (r && typeof r === 'object' && 'current' in r) {
          (r as { current: HTMLElement | null }).current = node
        }
      },
      onMouseEnter: (e: MouseEvent) => {
        child.props?.onMouseEnter?.(e)
        hoverIn()
      },
      onMouseLeave: (e: MouseEvent) => {
        child.props?.onMouseLeave?.(e)
        hoverOut()
      },
      onClick: (e: MouseEvent) => {
        child.props?.onClick?.(e)
        onTriggerClick(e)
      }
    } as never)
  } else {
    trigger = (
      <span
        ref={setTriggerNode}
        className={'Tooltip__Trigger'}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
        onClick={onTriggerClick}
      >
        {children}
      </span>
    )
  }

  const tipNode = isOpen && mounted
    ? (
      <div
        ref={tipRef}
        className={`Tooltip ${extraClass}${className ? ` ${className}` : ''}`}
        role={'tooltip'}
        style={{
          position: 'fixed',
          top: pos ? pos.top : 0,
          left: pos ? pos.left : 0,
          transform: pos ? pos.transform : 'translate(-50%, -100%)',
          zIndex: 1800,
          visibility: pos ? 'visible' : 'hidden',
          pointerEvents: pos ? 'auto' : 'none'
        }}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <div className={'Tooltip__Body'}>
          {title ? <div className={'Tooltip__Title'}>{title}</div> : null}
          {body ? <div className={'Tooltip__Content'}>{body}</div> : null}
        </div>
      </div>
      )
    : null

  return (
    <>
      {trigger}
      {tipNode ? createPortal(tipNode, document.body) : null}
    </>
  )
}
