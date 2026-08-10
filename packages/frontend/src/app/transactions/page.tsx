import type { Metadata } from 'next'
import Transactions from './Transactions'

export const metadata: Metadata = {
  title: 'Transactions — Dash Platform Explorer',
  description: 'Identities on Dash Platform. The Identifier, Date of Creation',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identities'],
  applicationName: 'Dash Platform Explorer'
}

interface TransactionsRouteProps {
  searchParams: {
    page?: string
    'page-size'?: string
  }
}

function TransactionsRoute ({ searchParams }: TransactionsRouteProps) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams['page-size'])

  return <Transactions defaultPage={page} defaultPageSize={pageSize}/>
}

export default TransactionsRoute
