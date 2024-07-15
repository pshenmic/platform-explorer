'use client'
import { useState } from 'react'
import './NetworkSelect.scss'
import Dropdown from './Dropdown'

const listNetworks = [
  { name: 'testnet', subname: '', activeButton: true },
  { name: 'mainnet', subname: 'Soon', activeButton: false },
  { name: 'devnet-abc', subname: 'Soon', activeButton: false }
] 

function NetworkSelect () {
  const [activeNetwork, setActiveNetwork] = useState(listNetworks[0].name)
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className='NetworkSelect' onMouseLeave={() => setShowDropdown(false)}>
      <p>Network:</p>
      <button
        className='NetworkSelect__Button'
        onMouseEnter={() => setShowDropdown(true)}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {activeNetwork}
        <svg
          className={`NetworkSelect__Arrow ${showDropdown ? 'Arrow__Active' : ''}`}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 5L5 1L9 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className={`NetworkSelect__DropdownWrapper ${showDropdown ? 'DropdownWrapper__Active' : ''}`}>
        <Dropdown active={activeNetwork} setActive={setActiveNetwork} data={listNetworks} />
      </div>
    </div>
  )
}

export default NetworkSelect
