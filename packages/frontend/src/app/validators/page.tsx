import type { Metadata } from 'next'
import { Suspense } from 'react'
import Validators from './Validators'
import { ValidatorsListSceleton } from '../../components/validators'

export const metadata: Metadata = {
  title: 'Validators — Dash Platform Explorer',
  description:
    'All validators on Dash Platform. Statistics and status of validators on Dash Platform.',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Validators'],
  applicationName: 'Dash Platform Explorer'
}

function ValidatorsRoute() {
  return (
    <Suspense fallback={<ValidatorsListSceleton />}>
      <Validators />
    </Suspense>
  )
}

export default ValidatorsRoute
