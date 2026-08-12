import type { Metadata } from 'next'
import { Suspense } from 'react'
import Tokens from './Tokens'

export const metadata: Metadata = {
  title: 'Tokens — Dash Platform Explorer',
  description: 'Tokens on the Platform Explorer are digital assets managed through Dash Platform data contracts.',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Tokens', 'digital assets'],
  applicationName: 'Dash Platform Explorer'
}

function TokensRoute () {
  return (
    <Suspense fallback={null}>
      <Tokens/>
    </Suspense>
  )
}

export default TokensRoute
