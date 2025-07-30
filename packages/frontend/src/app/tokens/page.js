import Tokens from './Tokens'
import Intro from '../../components/intro'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import { Container } from '@chakra-ui/react'
import Cards from './Cards'

export const metadata = {
  title: 'Tokens — Dash Platform Explorer',
  description: 'Tokens on the Platform Explorer are digital assets managed through Dash Platform data contracts.',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Tokens', 'digital assets'],
  applicationName: 'Dash Platform Explorer'
}

function IdentitiesRoute ({ searchParams }) {
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
        title={'Tokens'}
        description={<Markdown>{introContent}</Markdown>}
        block={<Cards/>}
      />
    </Container>
    <Tokens defaultPage={page} defaultPageSize={pageSize}/>
  </>
}

export default IdentitiesRoute
