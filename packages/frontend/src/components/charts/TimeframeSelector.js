import { useState, useEffect } from 'react'
import TimeframeMenu from './TimeframeMenu'
import { Button } from '@chakra-ui/react'
import { CalendarIcon2, CloseIcon } from '../ui/icons'
import './TimeframeSelector.scss'

export default function TimeframeSelector ({
  config,
  menuIsActive,
  changeCallback,
  openStateCallback,
  menuRef,
  forceTimespan,
  className
}) {
  const [timespan, setTimespan] = useState(config.timespan.values[config.timespan.defaultIndex])
  const [menuIsOpen, setMenuIsOpen] = useState(false)

  useEffect(() => forceTimespan && setTimespan(forceTimespan), [forceTimespan])

  const changeHandler = (value) => {
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
    <div className={`TimeframeSelector ${menuIsOpen ? 'TimeframeSelector--MenuActive' : ''} ${className || ''}`}>
      <TimeframeMenu
        ref={menuRef}
        className={'TimeframeSelector__Menu'}
        config={config}
        changeCallback={changeHandler}
        forceTimespan={timespan}
      />
      <Button
        className={`TimeframeSelector__Button ${menuIsOpen ? 'TimeframeSelector__Button--Active' : ''}`}
        onClick={() => setMenuIsOpen(state => !state)}
      >
        <CalendarIcon2 mr={'10px'}/>
        {timespan?.label}
        <CloseIcon
          color={'gray.250'}
          style={{ transition: 'all .1s' }}
          ml={menuIsOpen ? '10px' : '0px'}
          w={menuIsOpen ? '8px' : '0px'}
          h={'8px'}
        />
      </Button>
    </div>
  )
}
