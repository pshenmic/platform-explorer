import { SuccessIcon, ErrorIcon, QueuedIcon, PooledIcon, BroadcastedIcon } from '../../ui/icons'
import { Tooltip } from '../../ui/Tooltips'

function StatusIcon ({ status, ...props }) {
  const StatusIcons = {
    QUEUED: <QueuedIcon {...props}/>,
    POOLED: <PooledIcon {...props}/>,
    BROADCASTED: <BroadcastedIcon {...props}/>,
    COMPLETE: <SuccessIcon {...props}/>,
    EXPIRED: <ErrorIcon {...props}/>
  }

  const tooltipTitle = {
    QUEUED: 'Queued',
    POOLED: 'Pooled',
    BROADCASTED: 'Broadcasted',
    COMPLETE: 'Complete',
    EXPIRED: 'Expired'
  }

  return StatusIcons[status]
    ? <Tooltip title={tooltipTitle[status]} placement={'top'}>
        <span>{StatusIcons[status]}</span>
      </Tooltip>
    : null
}

export default StatusIcon
