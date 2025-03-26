import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, Text, useOutsideClick } from '@chakra-ui/react'
import { useSpring, animated } from 'react-spring'
import { useDrag } from '@use-gesture/react'
import './BottomSheet.scss'

const DRAWER_HEIGHT = '70vh'
const FULL_HEIGHT = '90vh'
const DRAG_THRESHOLD = 100

export const BottomSheet = ({
  isOpen,
  onClose,
  onOpen,
  title,
  children
}) => {
  const [{ y }, api] = useSpring(() => ({ y: 0 }))
  const [isExpanded, setIsExpanded] = useState(false)
  const drawerRef = useRef(null)

  const handleOpen = useCallback(() => {
    api.start({ y: 0 })
    setIsExpanded(false)
    onOpen()
  }, [api, onOpen])

  const handleClose = useCallback(() => {
    api.start({ y: window.innerHeight })
    setIsExpanded(false)
    setTimeout(onClose, 200)
  }, [api, onClose])

  useOutsideClick({
    ref: drawerRef,
    handler: () => isOpen && handleClose()
  })

  useEffect(() => {
    if (isOpen) {
      handleOpen()
    } else {
      handleClose()
    }
  }, [isOpen, handleOpen, handleClose])

  const bind = useDrag(
    ({ down, movement: [_, my], velocity: [, vy], direction: [, dy] }) => {
      if (!down && dy < 0 && (Math.abs(my) > DRAG_THRESHOLD || vy > 0.5)) {
        setIsExpanded(true)
        api.start({ y: 0 })
        return
      }

      if (!down && dy > 0 && (my > DRAG_THRESHOLD || vy > 0.5)) {
        handleClose()
        return
      }

      if (down) {
        const newY = Math.max(-window.innerHeight * 0.4, my)
        api.start({
          y: newY,
          immediate: true
        })
      } else {
        api.start({
          y: 0,
          immediate: false
        })
      }
    },
    {
      axis: 'y',
      bounds: {
        top: -window.innerHeight * 0.4,
        bottom: window.innerHeight
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
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          height: isExpanded ? FULL_HEIGHT : DRAWER_HEIGHT,
          transform: y.to(value => `translateY(${value}px)`),
          transition: 'height 0.2s ease-out'
        }}
      >
        <Box
          {...bind()}
          style={{
            touchAction: 'none',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
          className={'BottomSheet__ContentContainer'}
        >
          <DrawerHeader
            borderBottomWidth="1px"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            cursor={'grab'}
            className={'BottomSheet__DragHandle'}
            padding="0.5rem 1.5rem"
          >
            <div className={'BottomSheet__DragHandleLine'}/>
          </DrawerHeader>

          <Text className={'BottomSheet__Title'}>{title}</Text>

          <DrawerBody
            className={'BottomSheet__Body'}
            flex="1"
            overflowY="auto"
            display="flex"
            flexDirection="column"
          >
            <Box flex="1" minHeight="0">
              {children}
            </Box>
          </DrawerBody>
        </Box>
      </animated.div>
    </Drawer>
  )
}
