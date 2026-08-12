import type { Metadata } from 'next'
import Identities from './Identities'
import './IdentitiesPage.scss'

export const metadata: Metadata = {
  title: 'Identities — Dash Platform Explorer',
  description: 'Identities on Dash Platform. The Identifier, Date of Creation',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identities'],
  applicationName: 'Dash Platform Explorer'
}

interface IdentitiesRouteProps {
  searchParams: {
    page?: string
    'page-size'?: string
    'show-all'?: string
  }
}

function IdentitiesRoute ({ searchParams }: IdentitiesRouteProps) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams['page-size'])
  const showAll = searchParams['show-all'] === 'true'

  return <Identities defaultPage={page} defaultPageSize={pageSize} defaultShowAll={showAll}/>
}

export default IdentitiesRoute
