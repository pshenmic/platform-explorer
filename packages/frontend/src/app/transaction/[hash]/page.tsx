import { Transaction } from './components/Transaction'

interface TransactionPageParams {
  hash: string
}

export function generateMetadata ({ params }: { params: TransactionPageParams }) {
  return {
    title: 'Transaction #' + params.hash + ' — Dash Platform Explorer',
    description:
      'Transaction #' +
      params.hash +
      ' on dash platform. The Hash, Height, Type, Timestamp, Transaction data.',
    keywords: [
      'Dash',
      'platform',
      'explorer',
      'blockchain',
      'Transaction',
      'Hash',
      'Height',
      'Type',
      'Timestamp',
      'Data'
    ],
    applicationName: 'Dash Platform Explorer'
  }
}

function TransactionRoute () {
  return <Transaction />
}

export default TransactionRoute
