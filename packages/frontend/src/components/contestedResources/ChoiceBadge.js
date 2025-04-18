import { Badge } from '@chakra-ui/react'
import { ChoiceEnum, ChoiceInfo } from '../../enums/choiceEnum'
import './VoteBadges.scss'

function ChoiceBadge ({ choice, className }) {
  return (
    <div className={`VoteBadge ${className || ''}`}>
      <Badge
        className={'VoteBadge__Badge'}
        colorScheme={ChoiceInfo?.[ChoiceEnum?.[choice]]?.colorScheme}
        size={'xs'}
      >
        {ChoiceInfo?.[ChoiceEnum?.[choice]]?.title}
      </Badge>
    </div>
  )
}

export default ChoiceBadge
