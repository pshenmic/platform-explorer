'use client'

import {
  Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody
} from '@chakra-ui/react'
import { InfoOutlineIcon } from '@chakra-ui/icons'

// Click (not hover) so tooltip text is selectable / copyable.
function HelpPopover ({ children }) {
  return (
    <Popover trigger='click' placement='top' isLazy>
      <PopoverTrigger>
        <button
          type='button'
          aria-label='Help'
          style={{ display: 'inline-flex', alignItems: 'center', background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
        >
          <InfoOutlineIcon boxSize={3} color='gray.400'/>
        </button>
      </PopoverTrigger>
      <PopoverContent maxW='280px' fontSize='12px' fontFamily='var(--font-mono)'>
        <PopoverArrow/>
        <PopoverBody>{children}</PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default HelpPopover
