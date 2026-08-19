import type { Metadata } from 'next'
import ContestedResource from './ContestedResource'
import contestedResources from '../../../util/contestedResources'

interface ContestedResourceRouteProps {
  params: Promise<{ resourceValue: string }>
}

export const generateMetadata = async (props: ContestedResourceRouteProps): Promise<Metadata> => {
  const params = await props.params;
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

const ContestedResourceRoute = async (props: ContestedResourceRouteProps) => {
  const params = await props.params;
  return <ContestedResource resourceValue={params.resourceValue} />
}

export default ContestedResourceRoute
