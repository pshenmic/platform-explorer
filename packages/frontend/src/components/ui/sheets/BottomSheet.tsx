import { useOutsideClick } from '../../../hooks/useOutsideClick'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useSpring, animated } from 'react-spring'
import type { ComponentType, CSSProperties, ReactNode as RN } from 'react'

const AnimatedDiv = animated.div as unknown as ComponentType<{
  children?: RN
  ref?: React.Ref<HTMLDivElement>
  className?: string
  style?: CSSProperties
  onClick?: (e: React.MouseEvent) => void
}>
import { useDrag } from '@use-gesture/react'
import { useWindowSize } from '../../../hooks'
import './BottomSheet.css'

const DRAWER_HEIGHT = '70vh'
const FULL_HEIGHT = '90vh'
const DRAG_THRESHOLD = 100

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  title?: ReactNode
  children?: ReactNode
  fullHeightOnly?: boolean
}

export const BottomSheet = ({
  isOpen,
  onClose,
  onOpen,
  title,
  children,
  fullHeightOnly = false
}: BottomSheetProps) => {
  const { height: windowHeight } = useWindowSize()
  const [{ y }, api] = useSpring(() => ({ y: 0 }))
  const [isExpanded, setIsExpanded] = useState(fullHeightOnly)
  const drawerRef = useRef<HTMLDivElement | null>(null)

  const handleOpen = useCallback(() => {
    api.start({ y: 0 })
    setIsExpanded(fullHeightOnly)
    onOpen()
  }, [api, onOpen, fullHeightOnly])

  const handleClose = useCallback(() => {
    api.start({ y: windowHeight })
    setIsExpanded(false)
    setTimeout(onClose, 200)
  }, [api, onClose, windowHeight])

  useOutsideClick({
    ref: drawerRef,
    enabled: isOpen,
    handler: () => isOpen && handleClose()
  })

  useEffect(() => {
    isOpen ? handleOpen() : handleClose()
  }, [isOpen, handleOpen, handleClose])

  const bind = useDrag(
    ({ down, movement: [, my], velocity: [, vy], direction: [, dy] }) => {
      const maxDrag = -windowHeight * 0.4
      const shouldClose = !down && dy > 0 && (my > DRAG_THRESHOLD || vy > 0.5)
      const shouldExpand = !down && dy < 0 && (Math.abs(my) > DRAG_THRESHOLD || vy > 0.5)

      if (shouldClose) return handleClose()

      if (fullHeightOnly) {
        api.start({
          y: down ? Math.max(0, my) : 0,
          immediate: down
        })
        return
      }

      if (shouldExpand) {
        setIsExpanded(true)
        api.start({ y: 0 })
        return
      }

      api.start({
        y: down ? Math.max(maxDrag, my) : 0,
        immediate: down
      })
    },
    {
      axis: 'y',
      bounds: {
        top: fullHeightOnly ? 0 : -windowHeight * 0.4,
        bottom: windowHeight
      },
      rubberband: true,
      enabled: isOpen
    }
  )

  if (!isOpen) return null

  return (
    <>
      <div
        className={'BottomSheet__Overlay'}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          zIndex: 1390
        }}
        onClick={handleClose}
        aria-hidden
      />
      <AnimatedDiv
        ref={drawerRef}
        className={'BottomSheet'}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1400,
          height: fullHeightOnly ? FULL_HEIGHT : isExpanded ? FULL_HEIGHT : DRAWER_HEIGHT,
          transform: y.to(value => `translateY(${value}px)`) as unknown as string,
          transition: 'height 0.2s ease-out'
        }}
      >
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
          className={'BottomSheet__ContentContainer'}
        >
          <div {...bind()} className={'BottomSheet__DragHandle'}>
            <div className={'BottomSheet__DragHandleLine'} />
          </div>

          {title ? <div className={'BottomSheet__Title'}>{title}</div> : null}

          <div className={'BottomSheet__Body'}>
            <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
          </div>
        </div>
      </AnimatedDiv>
    </>
  )
}
