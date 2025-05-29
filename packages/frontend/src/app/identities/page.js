import Identities from './Identities'
import Intro from '../../components/intro'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import { Container } from '@chakra-ui/react'
import { TopIdentities } from '../../components/identities'

export const metadata = {
  title: 'Identities — Dash Platform Explorer',
  description: 'Identities on Dash Platform. The Identifier, Date of Creation',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identities'],
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
        title={'Identities'}
        description={<Markdown>{introContent}</Markdown>}
        block={<TopIdentities/>}
      />
    </Container>
    <Identities defaultPage={page} defaultPageSize={pageSize}/>
  </>
}

export default IdentitiesRoute
