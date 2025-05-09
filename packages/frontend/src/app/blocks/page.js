import Markdown from '../../components/markdown'
import Intro from '../../components/intro/index.js'
import introContent from './intro.md'
import { Container } from '@chakra-ui/react'
import Blocks from './Blocks'
import { BlocksDashboardCards } from '../../components/blocks'
import './BlocksIntro.scss'

export const metadata = {
  title: 'Blocks — Dash Platform Explorer',
  description: 'Blocks that are included in the Dash Platform blockchain. The Timestamp, Hash, Transactions count.',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'blocks', 'Timestamp', 'Hash', 'Transactions'],
  applicationName: 'Dash Platform Explorer'
}

async function BlocksRoute ({ searchParams }) {
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
        className={'BlocksIntro'}
        title={'Blocks'}
        description={<Markdown>{introContent}</Markdown>}
        block={<BlocksDashboardCards/>}
      />
    </Container>

    <Blocks defaultPage={page} defaultPageSize={pageSize}/>
  </>
}

export default BlocksRoute
