import type { Metadata } from 'next'
import ContestedResource from './ContestedResource'
import contestedResources from '../../../util/contestedResources'

interface ContestedResourceRouteProps {
  params: { resourceValue: string }
}

export const generateMetadata = async ({ params }: ContestedResourceRouteProps): Promise<Metadata> => {
  const resourceValue = decodeURIComponent(params.resourceValue)
  const decodedValue = contestedResources.decodeValue(resourceValue)
  const readableValue = contestedResources.getResourceValue(decodedValue as never)

  return {
    title: `${readableValue} — Contested Resource — Dash Platform Explorer`,
    description: `Detailed view of contested resource "${readableValue}" on the Dash Platform. Track current dispute status, masternode voting breakdown, creation date, and resolution outcome in the Dash Platform Explorer`,
    keywords: [
      'Dash',
      'platform',
      'explorer',
      'blockchain',
      'contested resource',
      readableValue,
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

const ContestedResourceRoute = ({ params }: ContestedResourceRouteProps) => {
  return <ContestedResource resourceValue={params.resourceValue} />
}

export default ContestedResourceRoute
