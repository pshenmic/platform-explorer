import ContestedResources from './ContestedResources'
import { Container } from '@chakra-ui/react'
import Intro from '../../components/intro'
import Markdown from '../../components/markdown'
import ContestedResourcesDashboardCards from '../../components/contestedResources/ContestedResourcesDashboardCards'
import introContent from './intro.md'

export async function generateMetadata ({ params }) {
  return {
    title: 'Contested resource — Dash Platform Explorer',
    description: 'Contested resource on Dash Platform.',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'data contract', 'datacontract', 'Schema', 'Documents', 'Date of Creation', 'Revision', 'Transaction'],
    applicationName: 'Dash Platform Explorer'
  }
}

function ContestedResourcesRoute ({ searchParams }) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams['page-size'])

  return (
    <div>
      <Container
        maxW={'container.xl'}
        color={'white'}
        mt={8}
        mb={0}
      >
        <Intro
          className={'ContestedResourcesIntro'}
          title={'Contested Resources'}
          description={<Markdown>{introContent}</Markdown>}
          block={<ContestedResourcesDashboardCards/>}
        />
        <ContestedResources defaultPage={page} defaultPageSize={pageSize}/>
      </Container>
    </div>

  )
}

export default ContestedResourcesRoute
