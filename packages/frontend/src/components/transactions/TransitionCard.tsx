// Direct paths — do not import documents/tokens barrels (circular with transactions/index)
import TokenTransitionCard from '../tokens/TokenTransitionCard'
import DocumentTransitionCard from '../documents/DocumentTransitionCard'
import type { Rate } from '../../types'
import type { WithClassName } from '../../types/common'
import './TransitionCard.css'

/** Document/token transition payload from state transition data (loose shape). */
export interface TransitionData {
  transitionType?: string | null
  action?: string | null
  [key: string]: unknown
}

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
      transition={(transition ?? {}) as Record<string, unknown>}
      owner={owner}
      rate={rate as Rate | null | undefined}
      className={`TransitionCard ${className || ''}`}
    />
  )
}

export default TransitionCard
