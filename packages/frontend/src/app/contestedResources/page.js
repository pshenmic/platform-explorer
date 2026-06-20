import ContestedResources from './ContestedResources'
import { Container } from '@chakra-ui/react'
import Intro from '../../components/intro'
import ContestedResourcesDashboardCards from '../../components/contestedResources/ContestedResourcesDashboardCards'
import introContent from './intro.md'

export async function generateMetadata () {
  return {
    title: 'Contested Resources — Dash Platform Explorer',
    description: 'Browse active contested resource disputes on the Dash Platform. View ongoing masternode vote tallies, dispute deadlines, and resolution history for contested resources in the Dash ecosystem',
    keywords: [
      'Dash',
      'platform',
      'explorer',
      'blockchain',
      'contested resources',
      'DPNS',
      'name service',
      'masternodes',
      'voting',
      'dispute',
      'resource registry',
      'data contract'
    ],
    applicationName: 'Dash Platform Explorer'
  }
}

function ContestedResourcesRoute ({ searchParams }) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams['page-size'])

  return (
    <div>
      <Container
        maxW={'container.maxPageW'}
        color={'white'}
        mt={8}
        mb={0}
      >
        <Intro
          className={'ContestedResourcesIntro'}
          title={'Contested Resources'}
          description={introContent}
          block={<ContestedResourcesDashboardCards/>}
        />
        <ContestedResources defaultPage={page} defaultPageSize={pageSize}/>
      </Container>
    </div>

  )
}

export default ContestedResourcesRoute
