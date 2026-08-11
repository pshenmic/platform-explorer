import type { Metadata } from 'next'
import Token from './Token'

interface TokenRouteProps {
  params: Promise<{ identifier: string }>
}

export async function generateMetadata(props: TokenRouteProps): Promise<Metadata> {
  const params = await props.params;
  return {
    title: 'Token #' + params.identifier + ' — Dash Platform Explorer',
    description: `Explore detailed information about Token ${params.identifier} on Dash Platform blockchain. View token balance, transaction history, transfers, associated documents, and related data contracts all in one place.`,
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Token', 'Identifier'],
    applicationName: 'Dash Platform Explorer'
  }
}

async function TokenRoute(props: TokenRouteProps) {
  const params = await props.params;
  return <Token identifier={params.identifier}/>
}

export default TokenRoute
