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
import type { FocusEvent, MouseEvent, ReactElement, ReactNode, Ref } from 'react'
import { createPortal } from 'react-dom'
import { useOutsideClick } from '../../../hooks/useOutsideClick'
import { useTooltipActive } from '../../../contexts/TooltipProvider'
import './Tooltip.css'

const LEAVE_GRACE_MS = 420
const GUTTER = 10
const VIEW_PAD = 12

type TipPos = { top: number; left: number; transform: string; placement: string }

function placeFixed(rect: DOMRect, placement: string, tipW = 240, tipH = 80): TipPos {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  let next = placement || 'top'

  if (next === 'top' && rect.top < tipH + GUTTER + VIEW_PAD) next = 'bottom'
  if (next === 'bottom' && window.innerHeight - rect.bottom < tipH + GUTTER + VIEW_PAD) next = 'top'
  if (next === 'right' && window.innerWidth - rect.right < tipW + GUTTER + VIEW_PAD) next = 'left'
  if (next === 'left' && rect.left < tipW + GUTTER + VIEW_PAD) next = 'right'

  let top = 0
  let left = cx
  let transform = ''

  if (next === 'right') {
    top = cy
    left = rect.right + GUTTER
    transform = 'translate(0, -50%)'
  } else if (next === 'left') {
    top = cy
    left = rect.left - GUTTER
    transform = 'translate(-100%, -50%)'
  } else if (next === 'bottom') {
    top = rect.bottom + GUTTER
    transform = 'translate(-50%, 0)'
  } else {
    next = 'top'
    top = rect.top - GUTTER
    transform = 'translate(-50%, -100%)'
  }

  if (next === 'top' || next === 'bottom') {
    const half = tipW / 2
    const minCenter = VIEW_PAD + half
    const maxCenter = window.innerWidth - VIEW_PAD - half
    left =
      maxCenter > minCenter ? Math.min(maxCenter, Math.max(minCenter, left)) : window.innerWidth / 2
    const topEdge = next === 'top' ? top - tipH : top
    const boundedTop = Math.max(VIEW_PAD, Math.min(topEdge, window.innerHeight - tipH - VIEW_PAD))
    top = next === 'top' ? boundedTop + tipH : boundedTop
  } else {
    const half = tipH / 2
    const minCenter = VIEW_PAD + half
    const maxCenter = window.innerHeight - VIEW_PAD - half
    top =
      maxCenter > minCenter ? Math.min(maxCenter, Math.max(minCenter, top)) : window.innerHeight / 2
  }

  return { top, left, transform, placement: next }
}

// `label` is an alias of `content` for existing call sites.
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

export default function Tooltip({
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
  const body = content || label || ''
  const extraClass = title && body ? 'Tooltip--Extended' : ''
  const id = useId()
  const active = useTooltipActive()
  const deactivate = active?.deactivate
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pos, setPos] = useState<TipPos | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const tipRef = useRef<HTMLDivElement | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mounted, setMounted] = useState(false)

  const pinned = Boolean(active?.pinnedId && active.pinnedId === id)
  const pinnedRef = useRef(pinned)
  pinnedRef.current = pinned
  const locked = Boolean(active?.pinnedId && active.pinnedId !== id)
  const isMine = !active || active.activeId === id
  const openByInteraction = pinned || ((hovered || focused) && !locked)
  const openByProp = typeof isOpenProp === 'boolean' ? isOpenProp : openByInteraction
  const isOpen = !isDisabled && openByProp && (typeof isOpenProp === 'boolean' || isMine || pinned)

  useEffect(() => {
    setMounted(true)
  }, [])

  const clearLeave = useCallback(() => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current)
      leaveTimer.current = null
    }
  }, [])

  const release = useCallback(() => {
    clearLeave()
    setHovered(false)
    setFocused(false)
    setPos(null)
    active?.unpin(id)
    active?.deactivate(id)
  }, [active, id, clearLeave])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') release()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, release])

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
    handler: e => {
      if (!pinnedRef.current) return
      if (tipRef.current?.contains(e.target as Node | null)) return
      release()
    }
  })

  useEffect(
    () => () => {
      clearLeave()
      deactivate?.(id)
    },
    [id, deactivate, clearLeave]
  )

  useEffect(() => {
    if (active && active.activeId != null && active.activeId !== id && !pinned) {
      clearLeave()
      setHovered(false)
      setFocused(false)
      setPos(null)
    }
  }, [id, active, pinned, clearLeave])

  const hoverIn = () => {
    if (locked) return
    clearLeave()
    setHovered(true)
    active?.activate(id)
  }

  const hoverOut = () => {
    clearLeave()
    leaveTimer.current = setTimeout(() => {
      setHovered(false)
      if (!pinned && !focused) {
        active?.deactivate(id)
        setPos(null)
      }
    }, LEAVE_GRACE_MS)
  }

  const onTriggerFocus = () => {
    clearLeave()
    if (active?.pinnedId && active.pinnedId !== id) active.unpin(active.pinnedId)
    setFocused(true)
    active?.activate(id)
  }

  const onTriggerBlur = (event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) return
    release()
  }

  const onTriggerClick = (e: MouseEvent) => {
    if (
      e.target !== e.currentTarget &&
      (e.target as HTMLElement).closest?.('a, button, [role="link"]')
    )
      return
    clearLeave()
    if (pinned) {
      setHovered(false)
      setFocused(false)
      setPos(null)
      active?.unpin(id)
      return
    }
    setHovered(true)
    active?.pin(id)
  }

  const setTriggerNode = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node
  }, [])

  let trigger: ReactNode
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{
      onMouseEnter?: (e: MouseEvent) => void
      onMouseLeave?: (e: MouseEvent) => void
      onClick?: (e: MouseEvent) => void
      onFocus?: (e: FocusEvent<HTMLElement>) => void
      onBlur?: (e: FocusEvent<HTMLElement>) => void
      ref?: Ref<HTMLElement>
      'aria-describedby'?: string
    }>
    trigger = cloneElement(child, {
      'aria-describedby':
        [child.props['aria-describedby'], isOpen ? id : undefined].filter(Boolean).join(' ') ||
        undefined,
      ref: (node: HTMLElement | null) => {
        setTriggerNode(node)
        const r = child.props.ref
        if (typeof r === 'function') r(node)
        else if (r && typeof r === 'object' && 'current' in r) {
          ;(r as { current: HTMLElement | null }).current = node
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
      },
      onFocus: (e: FocusEvent<HTMLElement>) => {
        child.props?.onFocus?.(e)
        onTriggerFocus()
      },
      onBlur: (e: FocusEvent<HTMLElement>) => {
        child.props?.onBlur?.(e)
        onTriggerBlur(e)
      }
    } as never)
  } else {
    trigger = (
      <span
        ref={setTriggerNode}
        className={'Tooltip__Trigger'}
        aria-describedby={isOpen ? id : undefined}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
        onClick={onTriggerClick}
        onFocus={onTriggerFocus}
        onBlur={onTriggerBlur}
      >
        {children}
      </span>
    )
  }

  const tipNode =
    isOpen && mounted ? (
      <div
        id={id}
        ref={tipRef}
        className={`Tooltip ${extraClass}${className ? ` ${className}` : ''}`}
        data-placement={pos?.placement || placement}
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
    ) : null

  return (
    <>
      {trigger}
      {tipNode ? createPortal(tipNode, document.body) : null}
    </>
  )
}
