import { useState, useEffect } from 'react'
import TimeframeMenu from './TimeframeMenu'
import { Button } from '@chakra-ui/react'
import { CalendarIcon } from '../../components/ui/icons'
import './TimeframeSelector.scss'

export default function TimeframeSelector ({
  config,
  isActive,
  changeCallback,
  openStateCallback,
  menuRef,
  className
}) {
  const [timespan, setTimespan] = useState(config.timespan.values[config.timespan.defaultIndex])
  const [menuIsOpen, setMenuIsOpen] = useState(false)

  const changeHandler = (value) => {
    setTimespan(value)
    if (typeof changeCallback === 'function') changeCallback(value)
    setMenuIsOpen(false)
  }

  useEffect(() => {
    if (!isActive) setMenuIsOpen(false)
  }, [isActive])

  useEffect(() => {
    if (typeof openStateCallback === 'function') openStateCallback(menuIsOpen)
  }, [menuIsOpen])

  return (
    <div className={`TimeframeSelector ${menuIsOpen ? 'TimeframeSelector--MenuActive' : ''} ${className || ''}`}>
      <TimeframeMenu
        ref={menuRef}
        className={'TimeframeSelector__Menu'}
        config={config}
        changeCallback={changeHandler}
      />
      <Button
        className={`TimeframeSelector__Button ${menuIsOpen ? 'TimeframeSelector__Button--Active' : ''}`}
        onClick={() => setMenuIsOpen(state => !state)}
      >
        <CalendarIcon mr={'10px'}/>
        {timespan.label}
      </Button>
    </div>
  )
}
