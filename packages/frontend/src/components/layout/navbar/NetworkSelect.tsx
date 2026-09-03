'use client'

import { useEffect, useRef, useState } from 'react'
import Dropdown from './Dropdown'
import { networks } from '../../../constants/networks'
import { useActiveNetwork } from 'src/contexts'

import './NetworkSelect.css'

function NetworkSelect() {
  const { name: network } = useActiveNetwork()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const openMenu = () => {
    cancelClose()
    setOpen(true)
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 220)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
      cancelClose()
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className={'NetworkSelect'}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <span className={'NetworkSelect__Title'}>Network:</span>
      <button
        type={'button'}
        className={'NetworkSelect__Button'}
        aria-expanded={open}
        aria-haspopup={'listbox'}
        onClick={() => setOpen(v => !v)}
      >
        {network || ''}
        <svg
          className={`NetworkSelect__Button--Arrow${open ? ' NetworkSelect__Button--ArrowActive' : ''}`}
          width={'10'}
          height={'6'}
          viewBox={'0 0 10 6'}
          fill={'none'}
          aria-hidden={'true'}
        >
          <path
            d={'M1 5L5 1L9 5'}
            stroke={'currentColor'}
            strokeWidth={'1.5'}
            strokeLinecap={'round'}
            strokeLinejoin={'round'}
          />
        </svg>
      </button>
      <div
        className={`NetworkSelect__DropdownWrapper${open ? ' NetworkSelect__DropdownWrapperActive' : ''}`}
        role={'listbox'}
        aria-label={'Networks'}
      >
        <Dropdown active={network} data={networks} />
      </div>
    </div>
  )
}

export default NetworkSelect
