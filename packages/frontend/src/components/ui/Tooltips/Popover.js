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
  Box
} from '@chakra-ui/react'
// import { useState } from 'react'

import './Popover.scss'

const CustomPopover = ({
  trigger, // кастомный Trigger элемент
  header, // заголовок поповера (необязательный)
  children, // контент поповера
  placement = 'bottom', // позиционирование поповера
  closeOnBlur = true, // закрытие при клике вне поповера
  hasArrow = false, // наличие стрелочки
  showCloseButton = false, // показывать кнопку закрытия
  popoverProps = {}, // любые дополнительные пропсы для Popover
  contentProps = {}, // дополнительные пропсы для PopoverContent
  stateCallback,
  className
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const handleToggle = () => (isOpen ? onClose() : onOpen())
  // const [open, setOpen] = useState(false)

  return (
    <Popover
      // isOpen={isOpen}
      // isOpen={open}
      isOpen={true}
      onClose={onClose}
      placement={placement}
      closeOnBlur={closeOnBlur}
      // onBlur={handleToggle}
      // onOpenChange={(e) => setOpen(e.open)}
      {...popoverProps}
    >
      <PopoverTrigger>
        <Box
          // onClick={(e) => {
            // e.stopPropagation()
            // handleToggle()
            // setOpen(s => !s)
          // }}
          display='inline-block'
        >
          {trigger}
        </Box>
      </PopoverTrigger>

      <PopoverContent className={`Popover__Content ${className || ''}`} {...contentProps}>
        {hasArrow && <PopoverArrow />}
        {showCloseButton && <PopoverCloseButton />}
        {header && <PopoverHeader>{header}</PopoverHeader>}
        <PopoverBody className={'Popover__Body'}>{children}</PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default CustomPopover
