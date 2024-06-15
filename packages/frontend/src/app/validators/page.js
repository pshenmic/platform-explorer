import Validators from './Validators'
import Intro from '../../components/intro'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import {
  Container,
  Flex,
  Box
} from '@chakra-ui/react'

export const metadata = {
  title: 'ValidatorsRoute — Dash Platform Explorer',
  description: 'ValidatorsRoute on Dash Platform. The Identifier, Date of Creation',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identities'],
  applicationName: 'Dash Platform Explorer'
}

function ValidatorsRoute () {
  return <>
    <Container
      maxW={'container.xl'}
      color={'white'}
      mt={8}
      mb={0}
    >
      <Flex
          justifyContent={'space-between'}
          alignItems={'center'}
          wrap={['wrap', 'wrap', 'wrap', 'nowrap']}
      >
          <Container maxW={['100%', '100%', '100%', 'calc(50% - 20px)']}>
            <Intro
              title={'Validators'}
              contentSource={<Markdown>{introContent}</Markdown>}
            />
          </Container>

          <Box flexShrink={'0'} w={10} h={[5, 5, 5, 10]}/>

          <Container maxW={'none'} p={0}>
            {/* <TopIdentities/> */}
          </Container>
      </Flex>
    </Container>
    <Validators/>
  </>
}

export default ValidatorsRoute
