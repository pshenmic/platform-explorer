import type { IconProps } from '@chakra-ui/react'
import type { ReactElement } from 'react'
import { SuccessIcon, ErrorIcon, QueuedIcon, PooledIcon, BroadcastedIcon } from '../ui/icons'

interface StatusIconProps extends IconProps {
  status?: string | null
}

function StatusIcon ({ status, ...props }: StatusIconProps) {
  if (!status) return <></>

  const StatusIcons: Record<string, ReactElement> = {
    SUCCESS: <SuccessIcon {...props}/>,
    FAIL: <ErrorIcon {...props}/>,
    QUEUED: <QueuedIcon {...props}/>,
    POOLED: <PooledIcon {...props}/>,
    BROADCASTED: <BroadcastedIcon {...props}/>
  }

  return StatusIcons[status] || <></>
}

export default StatusIcon
