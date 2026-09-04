import { useState, useEffect } from 'react'
import type { Ref } from 'react'
import TimeframeMenu from './TimeframeMenu'
import { CalendarIcon2, CloseIcon } from '../ui/icons'
import type { ChartConfig, TimespanValue } from './types'
import type { WithClassName } from '../../types/common'
import './TimeframeSelector.css'

interface TimeframeSelectorProps extends WithClassName {
  config: ChartConfig
  menuIsActive?: boolean
  changeCallback?: (value: TimespanValue) => void
  openStateCallback?: (open: boolean) => void
  menuRef?: Ref<HTMLDivElement>
  forceTimespan?: TimespanValue | null
}

export default function TimeframeSelector({
  config,
  menuIsActive,
  changeCallback,
  openStateCallback,
  menuRef,
  forceTimespan,
  className
}: TimeframeSelectorProps) {
  const [timespan, setTimespan] = useState<TimespanValue>(
    config.timespan.values[config.timespan.defaultIndex]
  )
  const [menuIsOpen, setMenuIsOpen] = useState(false)

  useEffect(() => {
    if (forceTimespan) setTimespan(forceTimespan)
  }, [forceTimespan])

  const changeHandler = (value: TimespanValue) => {
    setTimespan(value)
    if (typeof changeCallback === 'function') changeCallback(value)
    setMenuIsOpen(false)
  }

  useEffect(() => {
    if (!menuIsActive) setMenuIsOpen(false)
  }, [menuIsActive])

  useEffect(() => {
    if (typeof openStateCallback === 'function') openStateCallback(menuIsOpen)
  }, [menuIsOpen, openStateCallback])

  return (
    <div
      className={`TimeframeSelector ${menuIsOpen ? 'TimeframeSelector--MenuActive' : ''} ${className || ''}`}
    >
      <TimeframeMenu
        ref={menuRef}
        className={'TimeframeSelector__Menu'}
        config={config}
        changeCallback={changeHandler}
        forceTimespan={timespan}
      />
      <button
        type={'button'}
        className={`TimeframeSelector__Button ${menuIsOpen ? 'TimeframeSelector__Button--Active' : ''}`}
        onClick={() => setMenuIsOpen(state => !state)}
      >
        <CalendarIcon2 />
        {timespan?.label}
        <CloseIcon
          className={`TimeframeSelector__Close ${menuIsOpen ? 'TimeframeSelector__Close--Open' : ''}`}
        />
      </button>
    </div>
  )
}
