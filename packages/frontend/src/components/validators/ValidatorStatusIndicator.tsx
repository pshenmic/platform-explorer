import { Ban, Circle, CircleHelp, Clock } from 'lucide-react'
import type { getValidatorStatus } from './validatorStatus'
import { Tooltip } from '../ui/Tooltips'
import './ValidatorStatusIndicator.css'

const statusIcons = {
  banned: Ban,
  quorum: Circle,
  waiting: Clock,
  unknown: CircleHelp
}

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
  const Icon = statusIcons[key]
  const label = unavailable ? 'Unavailable' : status.label

  if (showLabel)
    return (
      <span className="ValidatorStatus" data-status={key}>
        <Icon className="ValidatorStatus__Icon" size={14} aria-hidden="true" focusable="false" />
        <span>{label}</span>
      </span>
    )
  return (
    <Tooltip title={label} content={descriptions[key]}>
      <span
        className="ValidatorStatus ValidatorStatus--compact"
        data-status={key}
        role="img"
        aria-label={label}
        tabIndex={0}
        onClick={event => event.stopPropagation()}
      >
        <Icon className="ValidatorStatus__Icon" size={16} aria-hidden="true" focusable="false" />
      </span>
    </Tooltip>
  )
}
