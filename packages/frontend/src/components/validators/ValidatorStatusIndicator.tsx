import { Ban, Circle, CircleHelp, Clock } from 'lucide-react'
import type { getValidatorStatus } from './validatorStatus'
import './ValidatorStatusIndicator.css'

const statusIcons = {
  banned: Ban,
  quorum: Circle,
  waiting: Clock,
  unknown: CircleHelp
}

export default function ValidatorStatusIndicator({
  status,
  unavailable = false
}: {
  status: ReturnType<typeof getValidatorStatus>
  unavailable?: boolean
}) {
  const key = unavailable ? 'unknown' : status.key
  const Icon = statusIcons[key]

  return (
    <span className="ValidatorStatus" data-status={key}>
      <Icon className="ValidatorStatus__Icon" size={14} aria-hidden="true" focusable="false" />
      <span>{unavailable ? 'Unavailable' : status.label}</span>
    </span>
  )
}
