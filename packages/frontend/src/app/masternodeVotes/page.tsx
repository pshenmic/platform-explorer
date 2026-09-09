import type { Metadata } from 'next'
import { Suspense } from 'react'
import MasternodeVotes from './MasternodeVotes'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Masternode Votes — Dash Platform Explorer',
    description:
      'Explore current and historical masternode vote polls on the Dash Platform. View poll details, stake-weighted vote tallies, start and end dates, and final outcomes in the Dash Platform Explorer',
    keywords: [
      'Dash',
      'platform',
      'explorer',
      'blockchain',
      'masternode votes',
      'voting',
      'polls',
      'governance',
      'consensus',
      'DPNS',
      'network'
    ],
    applicationName: 'Dash Platform Explorer'
  }
}

function MasternodeVotesRoute() {
  return (
    <Suspense fallback={null}>
      <MasternodeVotes />
    </Suspense>
  )
}

export default MasternodeVotesRoute
