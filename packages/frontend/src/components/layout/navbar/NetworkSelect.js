'use client'

import { useState } from 'react'
import './NetworkSelect.scss'
import Dropdown from './Dropdown'
import { networks } from '../../../constants/networks'

function NetworkSelect () {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const activeNetwork = networks.find(network => network.explorerBaseUrl === baseUrl)
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className={'NetworkSelect'} onMouseLeave={() => setShowDropdown(false)}>
      <span className={'NetworkSelect__Title'}>Network:</span>
      <button
        className={'NetworkSelect__Button'}
        onMouseEnter={() => setShowDropdown(true)}
      >
        {activeNetwork?.name || ''}
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
        <Dropdown active={activeNetwork?.name} data={networks} />
      </div>
    </div>
  )
}

export default NetworkSelect
