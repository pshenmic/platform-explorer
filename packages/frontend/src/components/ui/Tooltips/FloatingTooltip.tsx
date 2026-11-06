'use client'

import {
  cloneElement,
  createContext,
  isValidElement,
  useState,
  useLayoutEffect,
  type HTMLProps,
  type ReactElement,
  type Ref
} from 'react'
import {
  autoUpdate,
  flip,
  FloatingPortal,
  hide,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
  type Placement
} from '@floating-ui/react'
import type { TooltipProps } from './Tooltip'

export const FloatingTooltipScope = createContext(false)

function visibleViewport() {
  const header = document.querySelector('.Navbar')?.getBoundingClientRect()
  const top = Math.max(0, header?.bottom ?? 0)
  return { x: 0, y: top, width: window.innerWidth, height: Math.max(0, window.innerHeight - top) }
}

export default function FloatingTooltip({
  id,
  title = '',
  content = '',
  label,
  children,
  className = '',
  placement = 'top',
  asChild = true,
  isOpen: controlledOpen,
  isDisabled = false,
  onOpenChange,
  onFloatingEnter,
  onFloatingLeave,
  chart = false
}: TooltipProps) {
  const [localOpen, setLocalOpen] = useState(false)
  const controlled = typeof controlledOpen === 'boolean'
  const open = !isDisabled && (controlled ? controlledOpen : localOpen)
  const { refs, elements, floatingStyles, context, middlewareData, isPositioned } = useFloating({
    open,
    onOpenChange: next => {
      setLocalOpen(next)
      onOpenChange?.(next)
    },
    placement: placement as Placement,
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      flip(() => ({
        rootBoundary: visibleViewport(),
        padding: 12,
        fallbackAxisSideDirection: chart ? 'start' : 'none'
      })),
      shift(() => ({ rootBoundary: visibleViewport(), padding: 12 })),
      hide(() => ({ rootBoundary: visibleViewport() }))
    ]
  })
  useLayoutEffect(() => {
    const anchor = elements.reference
    if (!chart || !(anchor instanceof HTMLElement)) return
    refs.setPositionReference({
      contextElement: anchor,
      getBoundingClientRect() {
        const rect = anchor.getBoundingClientRect()
        const plot = anchor.closest('.ValidatorEpochs__Plot')?.getBoundingClientRect()
        const viewport = visibleViewport()
        if (!plot) return rect
        const visibleTop = Math.max(plot.top + 12, viewport.y + 12)
        const visibleBottom = Math.min(plot.bottom - 20, window.innerHeight - 12)
        if (visibleBottom <= visibleTop) return new DOMRect(rect.x, -100, rect.width, 1)
        const top = Math.max(visibleTop, Math.min(rect.top, visibleBottom))
        const bottom = Math.max(top + 1, Math.min(rect.bottom, visibleBottom))
        return new DOMRect(rect.x, top, rect.width, bottom - top)
      }
    })
  }, [chart, elements.reference, refs])
  const hover = useHover(context, {
    enabled: !controlled && !isDisabled,
    delay: { open: 100, close: 120 },
    handleClose: safePolygon()
  })
  const focus = useFocus(context, { enabled: !controlled && !isDisabled })
  const click = useClick(context, { enabled: !controlled && !isDisabled, stickIfOpen: true })
  const dismiss = useDismiss(context, {
    enabled: !isDisabled,
    outsidePress: event =>
      !chart || !(event.target instanceof Element && event.target.closest('.ValidatorEpochs__Hit'))
  })
  const role = useRole(context, { role: 'tooltip' })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    click,
    dismiss,
    role
  ])
  const child =
    asChild && isValidElement(children)
      ? (children as ReactElement<HTMLProps<HTMLElement> & { ref?: Ref<HTMLElement> }>)
      : null
  const mergedRef = useMergeRefs([refs.setReference, child?.props.ref])
  const body = content || label

  return (
    <>
      {child ? (
        cloneElement(child, {
          ...getReferenceProps(child.props),
          ref: mergedRef
        })
      ) : (
        <span className="Tooltip__Trigger" ref={refs.setReference} {...getReferenceProps()}>
          {children}
        </span>
      )}
      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            className={`Tooltip Tooltip--Floating${title && body ? ' Tooltip--Extended' : ''} ${className}`}
            data-chart-tooltip={chart || undefined}
            data-placement={context.placement}
            style={{
              ...floatingStyles,
              zIndex: 99,
              visibility:
                !isPositioned || middlewareData.hide?.referenceHidden ? 'hidden' : 'visible'
            }}
            {...getFloatingProps({ onMouseEnter: onFloatingEnter, onMouseLeave: onFloatingLeave })}
            id={id ?? context.floatingId}
          >
            <div className="Tooltip__Body">
              {title ? <div className="Tooltip__Title">{title}</div> : null}
              {body ? <div className="Tooltip__Content">{body}</div> : null}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  )
}
