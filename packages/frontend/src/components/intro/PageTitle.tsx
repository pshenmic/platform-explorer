'use client'

import {
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { InfoIcon } from '../ui/icons'
import type { WithClassName } from '../../types/common'
import './PageTitle.scss'

interface PageTitleProps extends WithClassName {
  title?: ReactNode
  description?: ReactNode
}

function PageTitle ({ title, description, className }: PageTitleProps) {
  return (
    <div className={`PageTitle ${className || ''}`}>
      <Heading className={'PageTitle__Title'} as={'h1'} size={'md'} m={0}>
        {title}
      </Heading>

      {description &&
        <Popover trigger={'click'} placement={'bottom-start'} isLazy>
          <PopoverTrigger>
            <button type={'button'} className={'PageTitle__InfoButton'} aria-label={'About'}>
              <InfoIcon boxSize={'16px'}/>
            </button>
          </PopoverTrigger>
          <Portal>
            <PopoverContent
              className={'PageTitle__DescriptionPopover'}
              bg={'gray.800'}
              border={'none'}
              w={'320px'}
              maxW={'calc(100vw - 2rem)'}
              borderRadius={'xl'}
              boxShadow={'0 1.25rem 2rem rgba(0, 0, 0, 0.35)'}
              zIndex={'popover'}
              _focus={{ outline: 'none', boxShadow: '0 1.25rem 2rem rgba(0, 0, 0, 0.35)' }}
            >
              <PopoverArrow bg={'gray.800'}/>
              <PopoverBody fontFamily={'body'} p={4}>
                <p className={'PageTitle__DescriptionText'}>{description}</p>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
      }
    </div>
  )
}

export default PageTitle
