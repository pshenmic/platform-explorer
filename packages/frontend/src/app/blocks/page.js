import Markdown from '../../components/markdown'
import Intro from '../../components/intro/index.js'
import introContent from './intro.md'
import { Container, Flex, Box } from '@chakra-ui/react'
import Blocks from './Blocks'
import { BlocksTotal } from '../../components/blocks'

export const metadata = {
  title: 'Blocks — Dash Platform Explorer',
  description: 'Blocks that are included in the Dash Platform blockchain. The Timestamp, Hash, Transactions count.',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'blocks', 'Timestamp', 'Hash', 'Transactions'],
  applicationName: 'Dash Platform Explorer'
}

async function BlocksRoute () {
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
                title={'Blocks'}
                contentSource={<Markdown>{introContent}</Markdown>}
            />
          </Container>

          <Box flexShrink={'0'} w={10} h={10} />

          <Container maxW={'none'} p={0}>
              <BlocksTotal/>
          </Container>
      </Flex>
    </Container>

    <Blocks/>
  </>
}

export default BlocksRoute
