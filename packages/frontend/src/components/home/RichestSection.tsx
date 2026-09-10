'use client'

import { Box } from '@chakra-ui/react'
import DataContractsRating from './DataContractsRating'
import TrendingTokens from './TrendingTokens'
import RichestIdentities from './RichestIdentities'
import './RichestSection.css'

// contracts / tokens / identities; embedded skips outer InfoBlock chrome
export default function RichestSection({
  rate,
  enabled = true,
  embedded = false
}: {
  rate?: unknown
  enabled?: boolean
  embedded?: boolean
}) {
  const body = (
    <div className={'HomeRichest__Grid'}>
      <div className={'HomeRichest__Col'}>
        <DataContractsRating enabled={enabled} />
      </div>
      <div className={'HomeRichest__Col'}>
        <TrendingTokens enabled={enabled} />
      </div>
      <div className={'HomeRichest__Col'}>
        <RichestIdentities rate={rate} enabled={enabled} />
      </div>
    </div>
  )

  if (embedded) {
    return (
      <div className={'HomeRichest HomeRichest--Embedded'} aria-label={'Richest'}>
        {body}
      </div>
    )
  }

  return (
    <Box
      className={'InfoBlock InfoBlock--NoBorder HomeRichest'}
      w={'100%'}
      as={'section'}
      aria-label={'Richest'}
    >
      {body}
    </Box>
  )
}
