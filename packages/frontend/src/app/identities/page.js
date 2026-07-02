import Identities from './Identities'
import './IdentitiesPage.scss'

export const metadata = {
  title: 'Identities — Dash Platform Explorer',
  description: 'Identities on Dash Platform. The Identifier, Date of Creation',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identities'],
  applicationName: 'Dash Platform Explorer'
}

function IdentitiesRoute ({ searchParams }) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams['page-size'])
  const showAll = searchParams['show-all'] === 'true'

  return <Identities defaultPage={page} defaultPageSize={pageSize} defaultShowAll={showAll}/>
}

export default IdentitiesRoute
