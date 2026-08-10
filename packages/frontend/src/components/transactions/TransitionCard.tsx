import type { ComponentType } from 'react'
import TokenTransitionCardJs from '../tokens/TokenTransitionCard'
import { DocumentTransitionCard as DocumentTransitionCardJs } from '../documents'
import type { Rate } from '../../types'
import type { WithClassName } from '../../types/common'
import './TransitionCard.scss'

/** Document/token transition payload from state transition data (loose shape). */
export interface TransitionData {
  transitionType?: string | null
  action?: string | null
  [key: string]: unknown
}

const DocumentTransitionCard = DocumentTransitionCardJs as ComponentType<{
  transition?: TransitionData | null
  owner?: string | null
  rate?: Pick<Rate, 'usd'> | null
  className?: string
}>

const TokenTransitionCard = TokenTransitionCardJs as ComponentType<{
  transition?: TransitionData | null
  owner?: string | null
  rate?: Pick<Rate, 'usd'> | null
  className?: string
}>

interface TransitionCardProps extends WithClassName {
  transition?: TransitionData | null
  owner?: string | null
  rate?: Pick<Rate, 'usd'> | null
}

const TransitionCard = ({ transition, owner, rate, className }: TransitionCardProps) => {
  if (transition?.transitionType === 'tokenTransition' || transition?.action?.includes('TOKEN')) {
    return (
      <TokenTransitionCard
        transition={transition}
        owner={owner}
        rate={rate}
        className={`TransitionCard ${className || ''}`}
      />
    )
  }

  return (
    <DocumentTransitionCard
      transition={transition}
      owner={owner}
      rate={rate}
      className={`TransitionCard ${className || ''}`}
    />
  )
}

export default TransitionCard
