'use client'
import { useState } from 'react'
import './Navbar.scss'
import InternalNavigation from './InternalNavigation'

const listNetworks = [
    { name: 'testnet', subname: '', activeButton: true },
    { name: 'mainnet', subname: 'Soon', activeButton: false },
    { name: 'devnet-abc', subname: 'Soon', activeButton: false },
]

function Network() {
    const [activeNetwork, setActiveNetwork] = useState(listNetworks[0].name)
    const [activeInternalNavigation, setActiveInternalNavigation] = useState(false)

    return (
        <div className='network'>
            <p>Network:</p>
            <button className='buttonNetwork' onClick={() => setActiveInternalNavigation(!activeInternalNavigation)}>{activeNetwork} 
                <svg className={`arrow ${activeInternalNavigation ? 'activeArrow' : null}`} width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L5 1L9 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            <div className={`wrapperInternalNavigationInNetwork ${activeInternalNavigation ? 'activeInternalNavigation' : null}`}>
                <InternalNavigation active={activeNetwork} setActive={setActiveNetwork} data={listNetworks}/>
            </div>
        </div>
    )
}

export default Network