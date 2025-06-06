import Token from './Token'

export async function generateMetadata ({ params }) {
  return {
    title: 'Token #' + params.identifier + ' — Dash Platform Explorer',
    description: 'Token #' + params.identifier + ' on Dash Platform. The Identifier, Balance, Transactions, Transfers, Documents, Data contracts',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Token', 'Identifier'],
    applicationName: 'Dash Platform Explorer'
  }
}

function TokenRoute ({ params }) {
  return <Token identifier={params.identifier}/>
}

export default TokenRoute
