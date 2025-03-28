import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, Text, useOutsideClick } from '@chakra-ui/react'
import { useSpring, animated } from 'react-spring'
import { useDrag } from '@use-gesture/react'
import { useWindowSize } from '../../../hooks'
import './BottomSheet.scss'

const DRAWER_HEIGHT = '70vh'
const FULL_HEIGHT = '90vh'
const DRAG_THRESHOLD = 100

export const BottomSheet = ({
  isOpen,
  onClose,
  onOpen,
  title,
  children,
  fullHeightOnly = false
}) => {
  const { height: windowHeight } = useWindowSize()
  const [{ y }, api] = useSpring(() => ({ y: 0 }))
  const [isExpanded, setIsExpanded] = useState(fullHeightOnly)
  const drawerRef = useRef(null)

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
    handler: () => isOpen && handleClose()
  })

  useEffect(() => {
    isOpen ? handleOpen() : handleClose()
  }, [isOpen, handleOpen, handleClose])

  const bind = useDrag(
    ({ down, movement: [_, my], velocity: [, vy], direction: [, dy] }) => {
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

  return (
    <Drawer
      isOpen={isOpen}
      placement={'bottom'}
      onClose={handleClose}
      size={'full'}
    >
      <DrawerOverlay />
      <animated.div
        ref={drawerRef}
        className={'BottomSheet'}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1400,
          height: fullHeightOnly ? FULL_HEIGHT : (isExpanded ? FULL_HEIGHT : DRAWER_HEIGHT),
          transform: y.to(value => `translateY(${value}px)`),
          transition: 'height 0.2s ease-out'
        }}
      >
        <Box
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
          className={'BottomSheet__ContentContainer'}
        >
          <DrawerHeader
            {...bind()}
            className={'BottomSheet__DragHandle'}
          >
            <div className={'BottomSheet__DragHandleLine'}/>
          </DrawerHeader>

          {title && <Text className={'BottomSheet__Title'}>{title}</Text>}

          <DrawerBody className={'BottomSheet__Body'}>
            <Box flex="1" minHeight="0">
              {children}
            </Box>
          </DrawerBody>
        </Box>
      </animated.div>
    </Drawer>
  )
}
