import TokenTransitionCard from '../tokens/TokenTransitionCard'
import { DocumentTransitionCard } from '../documents'
import './TransitionCard.scss'

const TransitionCard = ({ transition, owner, rate, className }) => {
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
