import { Badge } from '../ui/Badge'
import { Tooltip } from '../ui/Tooltips'
import type { WithClassName } from '../../types'
import './VoteBadges.css'

interface ContendersBadgeProps extends WithClassName {
  contenders?: number | string | unknown[] | null
}

function ContendersBadges({ contenders, className }: ContendersBadgeProps) {
  if (typeof contenders !== 'number' && typeof contenders !== 'string') return null

  return (
    <div className={`VoteBadges ${className || ''}`}>
      <Tooltip title={'Contenders'} placement={'top'}>
        <Badge
          className={'ContendersBadge'}
          colorScheme={'blue'}
          size={'xs'}
        >
          {contenders}
        </Badge>
      </Tooltip>
    </div>
  )
}

export default ContendersBadges
