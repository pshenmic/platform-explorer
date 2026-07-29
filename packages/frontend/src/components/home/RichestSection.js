'use client'

import { Box } from '@chakra-ui/react'
import { CardHead } from '../cards'
import DataContractsRating from './DataContractsRating'
import TrendingTokens from './TrendingTokens'
import RichestIdentities from './RichestIdentities'
import './RichestSection.scss'

// one card, three side-by-side leaderboards on desktop — stacks to one column below $breakpoint-lg
export default function RichestSection ({ rate, enabled = true }) {
  return (
    <Box className={'InfoBlock InfoBlock--NoBorder HomeRichest'} w={'100%'} as={'section'} aria-label={'Richest'}>
      <CardHead title={'Richest'}/>
      <div className={'HomeRichest__Grid'}>
        <div className={'HomeRichest__Col'}>
          <span className={'HomeRichest__ColTitle'}>Contracts</span>
          <DataContractsRating enabled={enabled}/>
        </div>
        <div className={'HomeRichest__Col'}>
          <span className={'HomeRichest__ColTitle'}>Tokens</span>
          <TrendingTokens enabled={enabled}/>
        </div>
        <div className={'HomeRichest__Col'}>
          <span className={'HomeRichest__ColTitle'}>Identities</span>
          <RichestIdentities rate={rate} enabled={enabled}/>
        </div>
      </div>
    </Box>
  )
}
