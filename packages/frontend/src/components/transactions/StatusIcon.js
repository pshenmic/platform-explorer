import { SuccessIcon, ErrorIcon, QueuedIcon, PooledIcon, BroadcastedIcon } from '../ui/icons'

function StatusIcon ({ status, ...props }) {
  const StatusIcons = {
    SUCCESS: <SuccessIcon {...props}/>,
    FAIL: <ErrorIcon {...props}/>,
    QUEUED: <QueuedIcon {...props}/>,
    POOLED: <PooledIcon {...props}/>,
    BROADCASTED: <BroadcastedIcon {...props}/>
  }

  return StatusIcons[status] || <></>
}

export default StatusIcon
