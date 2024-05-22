import Transactions from './Transactions'
import Intro from '../../components/intro/index.js'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import {
  Container
} from '@chakra-ui/react'

export const metadata = {
  title: 'Transactions — Dash Platform Explorer',
  description: 'Identities on Dash Platform. The Identifier, Date of Creation',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identities'],
  applicationName: 'Dash Platform Explorer'
}

function TransactionsRoute () {
  return <>
    <Container
      maxW={'container.lg'}
      color={'white'}
      mt={8}
      mb={0}
    >
        <Intro
            title={'Transactions'}
            contentSource={<Markdown>{introContent}</Markdown>}
        />
    </Container>
    <Transactions/>
  </>
}

export default TransactionsRoute
