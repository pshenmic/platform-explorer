import type { Metadata } from 'next'
import Identities from './Identities'
import './IdentitiesPage.css'

export const metadata: Metadata = {
  title: 'Identities — Dash Platform Explorer',
  description: 'Identities on Dash Platform. The Identifier, Date of Creation',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identities'],
  applicationName: 'Dash Platform Explorer'
}

function IdentitiesRoute() {
  return <Identities />
}

export default IdentitiesRoute
