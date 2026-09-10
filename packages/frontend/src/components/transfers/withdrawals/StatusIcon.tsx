import type { IconProps } from '@chakra-ui/react'
import { SuccessIcon, ErrorIcon, QueuedIcon, PooledIcon, BroadcastedIcon } from '../../ui/icons'
import { Tooltip } from '../../ui/Tooltips'
import type { ReactElement } from 'react'

interface StatusIconProps extends IconProps {
  status?: string | null
}

function StatusIcon({ status, ...props }: StatusIconProps) {
  if (!status) return null

  const StatusIcons: Record<string, ReactElement> = {
    QUEUED: <QueuedIcon {...props} />,
    POOLED: <PooledIcon {...props} />,
    BROADCASTED: <BroadcastedIcon {...props} />,
    COMPLETE: <SuccessIcon {...props} />,
    EXPIRED: <ErrorIcon {...props} />
  }

  const tooltipTitle: Record<string, string> = {
    QUEUED: 'Queued',
    POOLED: 'Pooled',
    BROADCASTED: 'Broadcasted',
    COMPLETE: 'Complete',
    EXPIRED: 'Expired'
  }

  return StatusIcons[status] ? (
    <Tooltip title={tooltipTitle[status]} placement={'top'}>
      <span>{StatusIcons[status]}</span>
    </Tooltip>
  ) : null
}

export default StatusIcon
