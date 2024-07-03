import Identities from './Identities'
import Intro from '../../components/intro'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import Cards from './Cards'
import { Container, Flex, Box } from '@chakra-ui/react'

export const metadata = {
  title: 'Identities — Dash Platform Explorer',
  description: 'Identities on Dash Platform. The Identifier, Date of Creation',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identities'],
  applicationName: 'Dash Platform Explorer'
}

function IdentitiesRoute ({ searchParams }) {
  const page = Number(searchParams.p) || 1
  const pageSize = Number(searchParams.ps)

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
              title={'Identities'}
              contentSource={<Markdown>{introContent}</Markdown>}
            />
          </Container>

          <Box flexShrink={'0'} w={10} h={[5, 5, 5, 10]}/>

          <Container maxW={'none'} p={0}>
            <Cards/>
          </Container>
      </Flex>
    </Container>
    <Identities defaultPage={page} defaultPageSize={pageSize}/>
  </>
}

export default IdentitiesRoute
