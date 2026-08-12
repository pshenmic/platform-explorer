import { Badge } from '@chakra-ui/react'
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
          colorScheme={'blue'}
          size={'xs'}
          ml={'0.25rem'}
          style={{ transition: '.1s' }}
          _hover={{ transform: 'scale(1.05)' }}
        >
          {contenders}
        </Badge>
      </Tooltip>
    </div>
  )
}

export default ContendersBadges
