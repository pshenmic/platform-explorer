import MasternodeVotes from './MasternodeVotes'
import { Container } from '@chakra-ui/react'
import Intro from '../../components/intro'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import MasternodeVotesDashboardCards from '../../components/contestedResources/MasternodeVotesDashboardCards'

export async function generateMetadata () {
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

function MasternodeVotesRoute ({ searchParams }) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams['page-size'])

  return (
    <div>
      <Container
        maxW={'container.maxPageW'}
        color={'white'}
        mt={8}
        mb={0}
      >
        <Intro
          className={'MasternodeVotesIntro'}
          title={'Masternode Votes'}
          description={<Markdown>{introContent}</Markdown>}
          block={<MasternodeVotesDashboardCards/>}
        />
        <MasternodeVotes defaultPage={page} defaultPageSize={pageSize}/>
      </Container>
    </div>
  )
}

export default MasternodeVotesRoute
