'use client'

import { useId, useRef, useState } from 'react'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { DateRangeFilter } from '../filters/DateRangeFilter'
import type { DateRangeFilterValue } from '../filters/types'
import './ChartDateRange.css'

const DAY = 86400000
const presets = [
  { label: '24h', durationMs: DAY },
  { label: '1W', durationMs: 7 * DAY },
  { label: '1M', durationMs: 30 * DAY },
  { label: '3M', durationMs: 90 * DAY },
  { label: '1Y', durationMs: 365 * DAY }
]
const config = {
  timespan: {
    defaultIndex: 2,
    values: presets.map(preset => ({ ...preset, range: { start: '', end: '' } }))
  }
}

export function defaultChartRange(): DateRangeFilterValue {
  const end = new Date()
  return { start: new Date(end.getTime() - 30 * DAY), end, mode: 'rolling' }
}

export function chartDateLabel(value: DateRangeFilterValue) {
  if (!value.start || !value.end) return 'Select dates'
  const duration = value.end.getTime() - value.start.getTime()
  const preset = value.mode === 'rolling' && presets.find(item => item.durationMs === duration)
  if (preset) return preset.label
  const format = (date: Date) =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
  return format(value.start) === format(value.end)
    ? format(value.start)
    : `${format(value.start)} – ${format(value.end)}`
}

export default function ChartDateRange({
  value,
  onChange
}: {
  value: DateRangeFilterValue
  onChange: (value: DateRangeFilterValue) => void
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
        className={'ChartDateRange__Trigger'}
        popoverTarget={id}
        aria-expanded={open}
        aria-label={`Chart date range: ${chartDateLabel(value)}`}
        onClick={() => {
          const rect = triggerRef.current!.getBoundingClientRect()
          const width = Math.min(352, window.innerWidth - 24)
          setPosition({
            left: Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)),
            top: Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - 420))
          })
        }}
      >
        <CalendarDays size={14} aria-hidden={true} />
        {chartDateLabel(value)}
        <ChevronDown size={12} aria-hidden={true} />
      </button>
      <div
        id={id}
        ref={panelRef}
        popover={'auto'}
        role={'dialog'}
        aria-label={'Chart date range'}
        className={'ChartDateRange__Panel'}
        style={position}
        onToggle={event => setOpen(event.newState === 'open')}
      >
        <DateRangeFilter
          compact={true}
          config={config}
          value={value}
          onChange={next => {
            onChange(next ?? defaultChartRange())
            panelRef.current?.hidePopover()
            triggerRef.current?.focus()
          }}
        />
        <p className={'ChartDateRange__Hint'}>Local time · Clear resets to 1M</p>
      </div>
    </>
  )
}
