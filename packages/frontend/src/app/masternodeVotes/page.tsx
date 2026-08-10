import type { Metadata } from 'next'
import MasternodeVotes from './MasternodeVotes'

export async function generateMetadata (): Promise<Metadata> {
  return {
    title: 'Masternode Votes — Dash Platform Explorer',
    description: 'Explore current and historical masternode vote polls on the Dash Platform. View poll details, stake-weighted vote tallies, start and end dates, and final outcomes in the Dash Platform Explorer',
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

interface MasternodeVotesRouteProps {
  searchParams: Promise<{
    page?: string
    'page-size'?: string
  }>
}

async function MasternodeVotesRoute(props: MasternodeVotesRouteProps) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams['page-size'])

  return <MasternodeVotes defaultPage={page} defaultPageSize={pageSize}/>
}

export default MasternodeVotesRoute
