'use client'

import {
  Popover,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  PopoverHeader,
  PopoverTrigger,
  useDisclosure,
  Box,
  useOutsideClick
} from '@chakra-ui/react'
import { useEffect, useRef } from 'react'

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
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const handleToggle = () => (isOpen ? onClose() : onOpen())
  const popoverRef = useRef()
  const triggerRef = useRef()

  useEffect(() => {
    typeof stateCallback === 'function' && stateCallback(isOpen)
  }, [isOpen, stateCallback])

  useOutsideClick({
    ref: popoverRef,
    handler: (event) => {
      if (
        popoverRef?.current &&
        !popoverRef?.current?.contains(event.target) &&
        triggerRef?.current &&
        !triggerRef?.current?.contains(event.target)
      ) {
        onClose()
      }
    }
  })

  return (
    <Popover
      isOpen={isOpen}
      onClose={onClose}
      placement={placement}
      closeOnBlur={closeOnBlur}
      {...popoverProps}
    >
      <PopoverTrigger>
        <Box
          ref={triggerRef}
          onClick={handleToggle}
          display='inline-block'
        >
          {trigger}
        </Box>
      </PopoverTrigger>

      <PopoverContent
        ref={popoverRef}
        className={`Popover__Content ${className || ''}`}
        {...contentProps}
      >
        {hasArrow && <PopoverArrow />}
        {showCloseButton && <PopoverCloseButton />}
        {header && <PopoverHeader>{header}</PopoverHeader>}
        <PopoverBody className={'Popover__Body'}>{children}</PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default CustomPopover
