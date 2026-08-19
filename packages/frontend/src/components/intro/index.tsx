import {
  Box,
  Heading
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { WithClassName } from '../../types/common'
import './Intro.scss'

interface IntroProps extends WithClassName {
  title?: ReactNode
  description?: ReactNode
  block?: ReactNode
}

function Intro ({ title, description, block, className }: IntroProps) {
  return (
    <div className={`Intro ${className || ''}`}>
      <div className={'Intro__Info'}>
        <Heading className={'Intro__Title'} as={'h1'} size={'lg'} m={0}>
          {title}
        </Heading>

        <Box my={3} w={16} h={'px'} background={'brand.normal'}/>

        {description}
      </div>
      {block && <div className={'Intro__Block'}>{block}</div>}
    </div>
  )
}

export default Intro
