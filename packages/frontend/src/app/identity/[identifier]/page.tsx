import type { Metadata } from 'next'
import Identity from './Identity'

interface IdentityRouteProps {
  params: Promise<{ identifier: string }>
}

export async function generateMetadata(props: IdentityRouteProps): Promise<Metadata> {
  const params = await props.params;
  return {
    title: 'Identity #' + params.identifier + ' — Dash Platform Explorer',
    description: 'Identity #' + params.identifier + ' on Dash Platform. The Identifier, Balance, Transactions, Transfers, Documents, Data contracts',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identity', 'Identifier', 'Balance', 'Transactions', 'Transfers', 'Documents', 'Data contracts'],
    applicationName: 'Dash Platform Explorer'
  }
}

async function IdentityRoute(props: IdentityRouteProps) {
  const params = await props.params;
  return <Identity identifier={params.identifier}/>
}

export default IdentityRoute
