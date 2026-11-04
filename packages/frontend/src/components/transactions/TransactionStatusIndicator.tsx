import { Check, Clock, Layers, Send, CircleX, TimerOff } from 'lucide-react'
import { NotActive } from '../data'
import { Badge } from '../ui/Badge'
import { Tooltip } from '../ui/Tooltips'
import './TransactionStatusIndicator.css'

const statuses = {
  SUCCESS: { label: 'Success', icon: Check, color: 'emerald' },
  COMPLETE: { label: 'Complete', icon: Check, color: 'emerald' },
  FAIL: { label: 'Failed', icon: CircleX, color: 'red' },
  EXPIRED: { label: 'Expired', icon: TimerOff, color: 'orange' },
  QUEUED: { label: 'Queued', icon: Clock, color: 'orange' },
  POOLED: { label: 'Pooled', icon: Layers, color: 'blue' },
  BROADCASTED: { label: 'Broadcasted', icon: Send, color: 'blue' }
}

export default function TransactionStatusIndicator({ status }: { status?: string | null }) {
  if (!status) return <NotActive />
  const info = Object.hasOwn(statuses, status)
    ? statuses[status as keyof typeof statuses]
    : undefined
  if (!info) return <Badge colorScheme="dimGray">{status}</Badge>
  const Icon = info.icon
  return (
    <Tooltip content={info.label}>
      <Badge
        className="TransactionStatusIndicator"
        colorScheme={info.color}
        tabIndex={0}
        aria-label={info.label}
        onClick={event => event.stopPropagation()}
      >
        <Icon size={16} strokeWidth={1.5} aria-hidden="true" focusable="false" />
      </Badge>
    </Tooltip>
  )
}
