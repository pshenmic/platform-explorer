import Identities from './Identities'
import Intro from '../../components/intro'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import {
  Container,
  Flex,
  Box
} from '@chakra-ui/react'
import RichList from '../../components/lists/RichList'

export const metadata = {
  title: 'Identities — Dash Platform Explorer',
  description: 'Identities on Dash Platform. The Identifier, Date of Creation',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identities'],
  applicationName: 'Dash Platform Explorer'
}

function IdentitiesRoute () {
  return <>
    <Container
      maxW={'container.lg'}
      color={'white'}
      mt={8}
      mb={0}
    >
      <Flex
          justifyContent={'space-between'}
          alignItems={'center'}
          wrap={['wrap', 'wrap', 'nowrap']}
      >
          <Container maxW={['100%', '100%', '100%', 'calc(50% - 20px)']}>
            <Intro
              title={'Identities'}
              contentSource={<Markdown>{introContent}</Markdown>}
            />
          </Container>

          <Box flexShrink={'0'} w={10} h={10} />

          <Container maxW={'none'} p={0}>
            <RichList printCount={5}/>
          </Container>
      </Flex>
    </Container>
    <Identities/>
  </>
}

export default IdentitiesRoute
