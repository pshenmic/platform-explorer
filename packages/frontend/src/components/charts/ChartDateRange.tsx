'use client'

import { useId, useRef, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { Presets } from '../cards'
import { Tooltip } from '../ui/Tooltips'
import { DateRangeFilter } from '../filters/DateRangeFilter'
import type { DateRangeFilterValue } from '../filters/types'
import { CHART_PRESETS, chartPresetValue, chartRangeLabel } from './dateRanges'
import './ChartDateRange.css'

export default function ChartDateRange({
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
  const selectedPreset =
    !value?.start || !value.end
      ? CHART_PRESETS.length - 1
      : value.mode === 'rolling'
        ? CHART_PRESETS.findIndex(
            preset => preset.ms === value.end!.getTime() - value.start!.getTime()
          )
        : -1
  const customRange = selectedPreset === -1
  const calendarLabel = customRange
    ? `Custom range: ${chartRangeLabel(value)}`
    : 'Choose custom dates'
  return (
    <>
      <div className="ChartDateRange" role="group" aria-label="Chart date range">
        <Presets
          options={CHART_PRESETS}
          value={selectedPreset}
          onChange={index => {
            onChange(chartPresetValue(CHART_PRESETS[index].label))
          }}
        />
        <Tooltip content={calendarLabel} placement="bottom" isDisabled={open}>
          <button
            ref={triggerRef}
            type={'button'}
            className={`ChartDateRange__Trigger Presets__Chip${customRange ? ' Presets__Chip--active' : ''}`}
            popoverTarget={id}
            aria-expanded={open}
            aria-controls={id}
            aria-haspopup="dialog"
            aria-pressed={customRange}
            aria-label={calendarLabel}
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
          </button>
        </Tooltip>
      </div>
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
          showPresets={false}
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
