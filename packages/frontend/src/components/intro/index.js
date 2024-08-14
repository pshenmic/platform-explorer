import {
  Box,
  Heading
} from '@chakra-ui/react'
import './Intro.scss'

function Intro ({ title, contentSource }) {
  return (
    <div className={'Intro'}>
        <Heading className={'Intro__Title'} as={'h1'} size={'lg'} m={0}>
          {title}
        </Heading>

        <Box my={4} w={16} h={'px'} background={'gray.700'}/>

        <div>{contentSource}</div>
    </div>
  )
}

export default Intro
