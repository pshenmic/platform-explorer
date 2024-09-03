'use client'

import { useState } from 'react'
import './NetworkSelect.scss'
import Dropdown from './Dropdown'

const listNetworks = [
  { name: 'mainnet', subname: '', disabled: false, link: 'https://platform-explorer.com' },
  { name: 'testnet', subname: '', disabled: false, link: 'https://testnet.platform-explorer.com' }
]

function NetworkSelect () {
  const origin = window.location.origin
  const activeNetwork = listNetworks.find(network => network.link === origin) || listNetworks[0]
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className={'NetworkSelect'} onMouseLeave={() => setShowDropdown(false)}>
      <p>Network:</p>
      <button
        className={'NetworkSelect__Button'}
        onMouseEnter={() => setShowDropdown(true)}
      >
        {activeNetwork.name}
        <svg
          className={`Button__Arrow ${showDropdown ? 'Button__ArrowActive' : ''}`}
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
        <Dropdown active={activeNetwork.name} data={listNetworks} />
      </div>
    </div>
  )
}

export default NetworkSelect
