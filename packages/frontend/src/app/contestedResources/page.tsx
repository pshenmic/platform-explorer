import ContestedResources from './ContestedResources'

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

  return <ContestedResources defaultPage={page} defaultPageSize={pageSize}/>
}

export default ContestedResourcesRoute
