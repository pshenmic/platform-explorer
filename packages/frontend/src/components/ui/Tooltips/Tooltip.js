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
import { createPortal } from 'react-dom'
import { useOutsideClick } from '@chakra-ui/react'
import { useTooltipActive } from 'src/contexts/TooltipProvider'
import './Tooltip.scss'

const LEAVE_GRACE_MS = 280
const GUTTER = 8
const VIEW_PAD = 12

function placeFixed (rect, placement, tipW = 240, tipH = 80) {
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
export default function Tooltip ({
  title = '',
  content = '',
  children,
  className,
  placement = 'top',
  asChild = true
}) {
  const extraClass = title && content ? 'Tooltip--Extended' : ''
  const id = useId()
  const active = useTooltipActive()
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pos, setPos] = useState(null)
  const pinnedRef = useRef(false)
  const triggerRef = useRef(null)
  const tipRef = useRef(null)
  const leaveTimer = useRef(null)
  const [mounted, setMounted] = useState(false)

  const isMine = !active || active.activeId === id
  const isOpen = isMine && (pinned || hovered)

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
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return
    const tipR = tipRef.current?.getBoundingClientRect()
    const tipW = tipR?.width || 260
    const tipH = tipR?.height || 90
    setPos(placeFixed(rect, placement, tipW, tipH))
  }, [placement])

  useLayoutEffect(() => {
    if (!isOpen) return undefined
    updatePos()
    // remeasure after tip paints (size known)
    const raf = requestAnimationFrame(() => updatePos())
    const onScroll = () => updatePos()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [isOpen, updatePos, title, content])

  useOutsideClick({
    ref: triggerRef,
    handler: (e) => {
      if (!pinnedRef.current) return
      if (tipRef.current?.contains(e.target)) return
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

  const onTriggerClick = (e) => {
    if (e.target !== e.currentTarget && e.target.closest('a, button, [role="link"]')) return
    setPinned(prev => {
      const next = !prev
      pinnedRef.current = next
      if (next) {
        clearLeave()
        setHovered(true)
        active?.activate(id)
      } else {
        active?.deactivate(id)
        setHovered(false)
        setPos(null)
      }
      return next
    })
  }

  const setTriggerNode = useCallback((node) => {
    triggerRef.current = node
  }, [])

  let trigger
  if (asChild && isValidElement(children)) {
    const child = children
    trigger = cloneElement(child, {
      ref: (node) => {
        setTriggerNode(node)
        const r = child.ref
        if (typeof r === 'function') r(node)
        else if (r && typeof r === 'object') r.current = node
      },
      onMouseEnter: (e) => {
        child.props?.onMouseEnter?.(e)
        hoverIn()
      },
      onMouseLeave: (e) => {
        child.props?.onMouseLeave?.(e)
        hoverOut()
      },
      onClick: (e) => {
        child.props?.onClick?.(e)
        onTriggerClick(e)
      }
    })
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

  const tipNode = isOpen && mounted && pos
    ? (
      <div
        ref={tipRef}
        className={`Tooltip ${extraClass}${className ? ` ${className}` : ''}`}
        role={'tooltip'}
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          transform: pos.transform,
          zIndex: 1800
        }}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        <div className={'Tooltip__Body'}>
          {title ? <div className={'Tooltip__Title'}>{title}</div> : null}
          {content ? <div className={'Tooltip__Content'}>{content}</div> : null}
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
