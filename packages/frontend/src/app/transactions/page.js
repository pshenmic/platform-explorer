import Transactions from './Transactions'
import Intro from '../../components/intro/index.js'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import { Container } from '@chakra-ui/react'
import TransactionsHistory from '../../components/charts/TransactionsHistory'

export const metadata = {
  title: 'Transactions — Dash Platform Explorer',
  description: 'Identities on Dash Platform. The Identifier, Date of Creation',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identities'],
  applicationName: 'Dash Platform Explorer'
}

function TransactionsRoute ({ searchParams }) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams['page-size'])

  return <>
    <Container
      maxW={'container.maxPageW'}
      color={'white'}
      mt={8}
      mb={0}
    >
      <Intro
        title={'Transactions'}
        description={<Markdown>{introContent}</Markdown>}
        block={<TransactionsHistory heightPx={400} blockBorders={false}/>}
      />
    </Container>
    <Transactions defaultPage={page} defaultPageSize={pageSize}/>
  </>
}

export default TransactionsRoute
