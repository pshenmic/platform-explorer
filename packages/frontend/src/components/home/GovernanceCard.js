'use client'

import { Box } from '@chakra-ui/react'
import { StatusBar } from './StatusBar'
import './GovernanceCard.css'

export default function GovernanceCard ({
  contested,
  activeContested,
  latestContested,
  latestVotes,
  epochData
}) {
  return (
    <Box
      className={'InfoBlock InfoBlock--NoBorder GovernanceCard'}
      w={'100%'}
      as={'section'}
      aria-label={'Governance'}
    >
      <header className={'GovernanceCard__Head'}>
        <div className={'GovernanceCard__HeadText'}>
          <span className={'GovernanceCard__Eyebrow'}>Governance</span>
          <h2 className={'GovernanceCard__Title'}>Contested &amp; votes</h2>
          <p className={'GovernanceCard__Lede'}>
            Names more than one identity is claiming, and the masternode votes that settle them.
          </p>
        </div>
      </header>

      <div className={'GovernanceCard__Body'}>
        <StatusBar
          contested={contested}
          activeContested={activeContested}
          latestContested={latestContested}
          latestVotes={latestVotes}
          epochData={epochData}
        />
      </div>
    </Box>
  )
}
