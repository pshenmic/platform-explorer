import Transaction from './TransactionPage'

export function generateMetadata ({ params }) {
  return {
    title: 'Transaction #' + params.hash + ' — Dash Platform Explorer',
    description: 'Transaction #' + params.hash + ' on dash platform. The Hash, Height, Type, Timestamp, Transaction data.',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Transaction', 'Hash', 'Height', 'Type', 'Timestamp', 'Data'],
    applicationName: 'Dash Platform Explorer'
  }
}

function TransactionRoute ({ params }) {
  return <Transaction hash={params.hash}/>
}

export default TransactionRoute
