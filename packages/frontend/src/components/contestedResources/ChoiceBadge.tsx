import { Badge } from '@chakra-ui/react'
import { ChoiceEnum, ChoiceInfo } from '../../enums/choiceEnum'
import type { WithClassName } from '../../types'
import './VoteBadges.scss'

interface ChoiceBadgeProps extends WithClassName {
  choice: number | string
}

function ChoiceBadge ({ choice, className }: ChoiceBadgeProps) {
  const choiceKey = ChoiceEnum[choice as keyof typeof ChoiceEnum]
  const info = typeof choiceKey === 'string' ? ChoiceInfo[choiceKey as keyof typeof ChoiceInfo] : undefined

  return (
    <div className={`VoteBadge ${className || ''}`}>
      <Badge
        className={'VoteBadge__Badge'}
        colorScheme={info?.colorScheme}
        size={'xs'}
      >
        {info?.title}
      </Badge>
    </div>
  )
}

export default ChoiceBadge
