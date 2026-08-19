import type { Metadata } from 'next'
import Identity from './Identity'

interface IdentityRouteProps {
  params: { identifier: string }
}

export async function generateMetadata ({ params }: IdentityRouteProps): Promise<Metadata> {
  return {
    title: 'Identity #' + params.identifier + ' — Dash Platform Explorer',
    description: 'Identity #' + params.identifier + ' on Dash Platform. The Identifier, Balance, Transactions, Transfers, Documents, Data contracts',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identity', 'Identifier', 'Balance', 'Transactions', 'Transfers', 'Documents', 'Data contracts'],
    applicationName: 'Dash Platform Explorer'
  }
}

function IdentityRoute ({ params }: IdentityRouteProps) {
  return <Identity identifier={params.identifier}/>
}

export default IdentityRoute
