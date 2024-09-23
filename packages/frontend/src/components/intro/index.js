import {
  Box,
  Heading
} from '@chakra-ui/react'
import './Intro.scss'

function Intro ({ title, description, block, contentSource, children }) {
  return (
    <div className={'Intro'}>
      <div className={'Intro__Info'}>
        <Heading className={'Intro__Title'} as={'h1'} size={'lg'} m={0}>
          {title}
        </Heading>

        <Box my={3} w={16} h={'px'} background={'brand.normal'}/>
        {/* <div>{contentSource || children}</div> */}
        {description}
      </div>
      {/* <div>123</div> */}

      {block && <div className={'Intro__Block'}>{block}</div>}
    </div>
  )
}

export default Intro
