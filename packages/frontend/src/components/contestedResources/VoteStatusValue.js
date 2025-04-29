import { ValueContainer } from '../ui/containers'
import './VoteBadges.scss'

function VoteStatusValue ({ status, size = 'sm', className }) {
  const colorSchemas = {
    finished: 'green',
    pending: 'blue',
    default: 'blue'
  }

  return (
    <div className={`VoteBadges ${className || ''}`}>
        <ValueContainer
          className={'VoteBadges__Badge'}
          colorScheme={colorSchemas?.[status?.toLowerCase()] || colorSchemas.default }
          size={size || 'sm'}
          style={{ textTransform: 'capitalize' }}
        >
          {status}
        </ValueContainer>
    </div>
  )
}

export default VoteStatusValue
