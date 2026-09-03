'use client'

import { useOutsideClick } from '../../../hooks/useOutsideClick'
import {
  Popover,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  PopoverHeader,
  PopoverTrigger,
  useDisclosure,
  Box
} from '@chakra-ui/react'
import type { PopoverProps, PopoverContentProps } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { WithChildren, WithClassName } from '../../../types/common'

interface CustomPopoverProps extends WithChildren, WithClassName {
  trigger?: ReactNode
  header?: ReactNode
  placement?: PopoverProps['placement']
  closeOnBlur?: boolean
  hasArrow?: boolean
  showCloseButton?: boolean
  popoverProps?: Partial<PopoverProps>
  contentProps?: Partial<PopoverContentProps>
  stateCallback?: (isOpen: boolean) => void
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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const handleToggle = () => (isOpen ? onClose() : onOpen())
  const popoverRef = useRef<HTMLElement | null>(null)
  const triggerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    typeof stateCallback === 'function' && stateCallback(isOpen)
  }, [isOpen, stateCallback])

  useOutsideClick({
    ref: popoverRef,
    handler: event => {
      const target = event.target as Node
      if (
        popoverRef?.current &&
        !popoverRef?.current?.contains(target) &&
        triggerRef?.current &&
        !triggerRef?.current?.contains(target)
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
        <Box ref={triggerRef} onClick={handleToggle} display="inline-block">
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
