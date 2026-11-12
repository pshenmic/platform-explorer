import type { getValidatorStatus } from './validatorStatus'
import { Badge } from '../ui/Badge'
import { Tooltip } from '../ui/Tooltips'
import './ValidatorStatusIndicator.css'

const descriptions = {
  banned: 'Banned by Proof of Service.',
  quorum: 'In the current Platform validator set.',
  waiting: 'Not in the current Platform validator set.',
  unknown: 'Validator status is unavailable.'
}

export default function ValidatorStatusIndicator({
  status,
  unavailable = false,
  showLabel = false
}: {
  status: ReturnType<typeof getValidatorStatus>
  unavailable?: boolean
  showLabel?: boolean
}) {
  const key = unavailable ? 'unknown' : status.key
  const label = unavailable ? 'Unavailable' : status.label
  const badge = (
    <Badge
      className="ValidatorStatus"
      colorScheme={unavailable ? 'gray' : status.colorScheme}
      tabIndex={showLabel ? undefined : 0}
      onClick={event => event.stopPropagation()}
    >
      {label}
    </Badge>
  )
  if (showLabel) return badge
  return (
    <Tooltip title={label} content={descriptions[key]}>
      {badge}
    </Tooltip>
  )
}
