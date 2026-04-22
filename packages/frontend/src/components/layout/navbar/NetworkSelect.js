'use client'

import { useState } from 'react'
import Dropdown from './Dropdown'
import { networks } from '../../../constants/networks'
import { useActiveNetwork } from 'src/contexts'

import './NetworkSelect.scss'

function NetworkSelect () {
  const { name: network } = useActiveNetwork()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className={'NetworkSelect'} onMouseLeave={() => setShowDropdown(false)}>
      <span className={'NetworkSelect__Title'}>Network:</span>
      <button
        className={'NetworkSelect__Button'}
        onMouseEnter={() => setShowDropdown(true)}
      >
        {network || ''}
        <svg
          className={`NetworkSelect__Button--Arrow ${showDropdown ? 'NetworkSelect__Button--ArrowActive' : ''}`}
          width={'10'}
          height={'6'}
          viewBox={'0 0 10 6'}
          fill={'none'}
          xmlns={'http://www.w3.org/2000/svg'}
        >
          <path d={'M1 5L5 1L9 5'} stroke={'white'} strokeWidth={'1.5'} strokeLinecap={'round'} strokeLinejoin={'round'} />
        </svg>
      </button>
      <div className={`NetworkSelect__DropdownWrapper ${showDropdown ? 'NetworkSelect__DropdownWrapperActive' : ''}`}>
        <Dropdown active={network} data={networks} />
      </div>
    </div>
  )
}

export default NetworkSelect
