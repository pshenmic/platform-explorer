import { ValueContainer } from '../ui/containers'
import type { WithClassName } from '../../types'
import './VoteBadges.scss'

interface VoteStatusValueProps extends WithClassName {
  status?: string | null
  size?: 'default' | 'xl' | 'lg' | 'md' | 'sm' | 'xs' | 'xxs'
}

function VoteStatusValue ({ status, size = 'sm', className }: VoteStatusValueProps) {
  const colorSchemas: Record<string, 'green' | 'blue'> = {
    finished: 'green',
    pending: 'blue',
    default: 'blue'
  }

  return (
    <div className={`VoteBadges ${className || ''}`}>
        <ValueContainer
          className={'VoteBadges__Badge'}
          colorScheme={colorSchemas?.[status?.toLowerCase() ?? ''] || colorSchemas.default }
          size={size || 'sm'}
          style={{ textTransform: 'capitalize' }}
        >
          {status}
        </ValueContainer>
    </div>
  )
}

export default VoteStatusValue
