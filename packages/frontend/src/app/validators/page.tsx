import type { Metadata } from 'next'
import Validators from './Validators'

export const metadata: Metadata = {
  title: 'Validators — Dash Platform Explorer',
  description:
    'All validators on Dash Platform. Statistics and status of validators on Dash Platform.',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Validators'],
  applicationName: 'Dash Platform Explorer'
}

function ValidatorsRoute() {
  return <Validators />
}

export default ValidatorsRoute
