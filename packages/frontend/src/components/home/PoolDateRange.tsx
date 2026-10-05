'use client'

import { useId, useRef, useState } from 'react'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { DateRangeFilter } from '../filters/DateRangeFilter'
import type { DateRangeFilterValue } from '../filters/types'
import { PRESETS } from './MetricChart'
import './PoolDateRange.css'

const presets = [
  ...PRESETS.slice(0, 3),
  { label: '3M', ms: 90 * 86400000 },
  ...PRESETS.slice(3, -1)
]
const config = {
  timespan: {
    defaultIndex: 0,
    values: presets.map(preset => ({
      label: preset.label,
      durationMs: preset.ms,
      range: { start: '', end: '' }
    }))
  }
}

export function poolRangeLabel(value: DateRangeFilterValue | null) {
  if (!value?.start || !value.end) return 'All time'
  if (value.mode === 'rolling') {
    const duration = value.end.getTime() - value.start.getTime()
    const preset = presets.find(option => option.ms === duration)
    if (preset) return preset.label
  }
  const format = (date: Date) =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
  const start = format(value.start)
  const end = format(value.end)
  return start === end ? start : `${start} – ${end}`
}

export default function PoolDateRange({
  value,
  onChange
}: {
  value: DateRangeFilterValue | null
  onChange: (value: DateRangeFilterValue | null) => void
}) {
  const id = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 12, left: 12 })
  return (
    <>
      <button
        ref={triggerRef}
        type={'button'}
        className={'PoolDateRange__Trigger'}
        popoverTarget={id}
        aria-expanded={open}
        aria-label={`Chart date range: ${poolRangeLabel(value)}`}
        onClick={() => {
          const rect = triggerRef.current!.getBoundingClientRect()
          const width = Math.min(352, window.innerWidth - 24)
          setPosition({
            left: Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)),
            top: Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - 460))
          })
        }}
      >
        <CalendarDays size={14} aria-hidden={true} />
        <span>{poolRangeLabel(value)}</span>
        <ChevronDown size={12} aria-hidden={true} />
      </button>
      <div
        id={id}
        ref={panelRef}
        popover={'auto'}
        role={'dialog'}
        aria-label={'Chart date range'}
        className={'PoolDateRange__Panel'}
        style={position}
        onToggle={event => setOpen(event.newState === 'open')}
      >
        <DateRangeFilter
          compact={true}
          config={config}
          value={value ?? undefined}
          onChange={next => {
            onChange(next)
            panelRef.current?.hidePopover()
            triggerRef.current?.focus()
          }}
        />
      </div>
    </>
  )
}
