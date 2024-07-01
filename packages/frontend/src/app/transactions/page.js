import Transactions from './Transactions'
import Intro from '../../components/intro/index.js'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import { Container, Flex, Box } from '@chakra-ui/react'
import TransactionsHistory from '../../components/charts/TransactionsHistory'

export const metadata = {
  title: 'Transactions — Dash Platform Explorer',
  description: 'Identities on Dash Platform. The Identifier, Date of Creation',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identities'],
  applicationName: 'Dash Platform Explorer'
}

function TransactionsRoute ({ searchParams }) {
  const page = Number(searchParams.page) || 1

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
              title={'Transactions'}
              contentSource={<Markdown>{introContent}</Markdown>}
            />
          </Container>

          <Box flexShrink={'0'} w={10} h={10} />

          <Container maxW={'none'} p={0}>
              <TransactionsHistory/>
          </Container>
      </Flex>
    </Container>
    <Transactions defaultPage={page}/>
  </>
}

export default TransactionsRoute
