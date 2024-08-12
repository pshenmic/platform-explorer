import DataContracts from './DataContracts'
import Intro from '../../components/intro'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import { Container, Flex, Box } from '@chakra-ui/react'
import Cards from './Cards'

export const metadata = {
  title: 'Data Contracts — Dash Platform Explorer',
  description: 'Data Contracts on Dash Platform. The Identifier, Date of Creation.',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'data contrancts', 'Datacontract', 'Identifier', 'Date of Creation'],
  applicationName: 'Dash Platform Explorer'
}

function DataContractsRoute ({ searchParams }) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams['page-size'])

  return <>
    <Container
      maxW={'container.xl'}
      color={'white'}
      px={0}
      mt={8}
      mb={0}
    >
      <Flex
          justifyContent={'space-between'}
          alignItems={'center'}
          wrap={['wrap', 'wrap', 'wrap', 'nowrap']}
      >
          <Container flexShrink={0} maxW={['100%', '100%', '100%', 'calc(50% - 20px)']}>
            <Intro
              title={'Data contracts'}
              contentSource={<Markdown>{introContent}</Markdown>}
            />
          </Container>

          <Box flexShrink={'0'} w={10} h={[5, 5, 5, 10]} />

          <Container flexShrink={0} maxW={['100%', '100%', '100%', 'calc(50% - 20px)']}>
            <Cards/>
          </Container>
      </Flex>
    </Container>
    <DataContracts defaultPage={page} defaultPageSize={pageSize}/>
  </>
}

export default DataContractsRoute
