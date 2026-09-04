'use client'

import MenuLevel from './MenuLevel'
import type { MenuItem } from './MenuLevel'
import {
  cloneElement,
  isValidElement,
  useCallback,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import type { CSSProperties, MouseEvent, ReactElement, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useOutsideClick } from '../../../hooks/useOutsideClick'
import './MultiLevelMenu.css'

type Placement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | string

interface MultiLevelMenuProps {
  menuData?: MenuItem[]
  /** Single element for the trigger (no competing onClick). */
  trigger?: ReactElement
  placement?: Placement
  onClose?: () => void
  onOpen?: () => void
  isOpen?: boolean
  onContentMouseEnter?: () => void
  onContentMouseLeave?: () => void
}

function placePanel(rect: DOMRect, placement: string): CSSProperties {
  const gutter = 0
  const pad = 12
  let top = rect.bottom + gutter
  let left = rect.left
  if (placement === 'bottom-end' || placement === 'top-end') {
    left = rect.right
  }
  if (placement?.startsWith('top')) {
    top = rect.top + gutter
  }
  const maxLeft = window.innerWidth - pad
  left = Math.min(Math.max(left, pad), maxLeft)
  if (placement === 'bottom-end' || placement === 'top-end') {
    return { position: 'fixed', top, left, transform: 'translateX(-100%)', zIndex: 1500 }
  }
  if (placement?.startsWith('top')) {
    return { position: 'fixed', top, left, transform: 'translateY(-100%)', zIndex: 1500 }
  }
  return { position: 'fixed', top, left, zIndex: 1500 }
}

function MultiLevelMenu({
  menuData = [],
  trigger,
  placement = 'bottom-start',
  onClose,
  onOpen,
  isOpen: isOpenProp,
  onContentMouseEnter,
  onContentMouseLeave
}: MultiLevelMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [pos, setPos] = useState<CSSProperties>({})
  const [mounted, setMounted] = useState(false)
  const triggerWrapRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const controlled = typeof isOpenProp === 'boolean'
  const isOpen = controlled ? Boolean(isOpenProp) : uncontrolledOpen

  const handleOpen = useCallback(() => {
    setSelectedIndex(null)
    if (!controlled) setUncontrolledOpen(true)
    onOpen?.()
  }, [onOpen, controlled])

  const handleClose = useCallback(() => {
    setSelectedIndex(null)
    if (!controlled) setUncontrolledOpen(false)
    onClose?.()
  }, [onClose, controlled])

  const toggle = useCallback(() => {
    if (isOpen) handleClose()
    else handleOpen()
  }, [isOpen, handleClose, handleOpen])

  useLayoutEffect(() => {
    setMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (!isOpen) return undefined
    const el = triggerWrapRef.current
    if (!el) return undefined
    const update = () => setPos(placePanel(el.getBoundingClientRect(), String(placement)))
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [isOpen, placement])

  useOutsideClick({
    ref: contentRef,
    enabled: isOpen,
    handler: event => {
      const target = event.target as Node
      if (triggerWrapRef.current?.contains(target)) return
      handleClose()
    }
  })

  const selected = selectedIndex != null ? menuData[selectedIndex] : undefined
  const showPanel = Boolean(selected?.content || selected?.subMenu?.length)

  let triggerNode: ReactNode = trigger ?? (
    <button type="button">Open menu</button>
  )
  if (isValidElement(trigger)) {
    const child = trigger as ReactElement<{ onClick?: (e: MouseEvent) => void }>
    triggerNode = cloneElement(child, {
      onClick: (e: MouseEvent) => {
        child.props?.onClick?.(e)
        toggle()
      }
    } as never)
  }

  const content = isOpen && mounted ? (
    createPortal(
      <div
        ref={contentRef}
        className={`MultiLevelMenu__Content${showPanel ? ' MultiLevelMenu__Content--WithPanel' : ''}`}
        style={pos}
        onMouseEnter={onContentMouseEnter}
        onMouseLeave={onContentMouseLeave}
      >
        <div className={'MultiLevelMenu__Body'}>
          <div className={'MultiLevelMenu__Layout'}>
            <div className={'MultiLevelMenu__Nav'}>
              <MenuLevel
                items={menuData}
                selectedIndex={selectedIndex}
                onSelectIndex={setSelectedIndex}
                onMenuItemClick={handleClose}
              />
            </div>
            {showPanel && (
              <div className={'MultiLevelMenu__Panel'}>
                {selected?.content}
                {selected?.subMenu?.length ? (
                  <MenuLevel items={selected.subMenu} onMenuItemClick={handleClose} />
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body
    )
  ) : null

  return (
    <div className={'MultiLevelMenu'}>
      <div ref={triggerWrapRef}>{triggerNode}</div>
      {content}
    </div>
  )
}

export default MultiLevelMenu
