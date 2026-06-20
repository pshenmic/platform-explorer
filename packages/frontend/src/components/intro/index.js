'use client'

import {
  Box,
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal
} from '@chakra-ui/react'
import { InfoIcon } from '../ui/icons'
import './Intro.scss'

function Intro ({ title, description, block, className }) {
  return (
    <div className={`Intro ${className || ''}`}>
      <div className={'Intro__Header'}>
        <Heading className={'Intro__Title'} as={'h1'} size={'lg'} m={0}>
          {title}
        </Heading>

        {description &&
          <Popover trigger={'click'} placement={'bottom-start'} isLazy>
            <PopoverTrigger>
              <button type={'button'} className={'Intro__InfoButton'} aria-label={'About'}>
                <InfoIcon boxSize={'18px'}/>
              </button>
            </PopoverTrigger>
            <Portal>
              <PopoverContent
                className={'Intro__DescriptionPopover'}
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
                  <p className={'Intro__DescriptionText'}>{description}</p>
                </PopoverBody>
              </PopoverContent>
            </Portal>
          </Popover>
        }
      </div>

      <Box className={'Intro__Divider'} my={3} w={16} h={'px'} background={'brand.normal'}/>

      {block && <div className={'Intro__Block'}>{block}</div>}
    </div>
  )
}

export default Intro
