import { SuccessIcon, ErrorIcon, QueuedIcon, PooledIcon, BroadcastedIcon } from '../../ui/icons'

function StatusIcon ({ status, ...props }) {
  const StatusIcons = {
    0: <QueuedIcon {...props}/>,
    1: <PooledIcon {...props}/>,
    2: <BroadcastedIcon {...props}/>,
    3: <SuccessIcon {...props}/>,
    4: <ErrorIcon {...props}/>

  }

  return StatusIcons[status] || <></>
}

export default StatusIcon
