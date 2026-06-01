'use client'

import { useState } from 'react'
import Features from './Features'
import History from './History'
import Distribution from './Distribution'
import './Features.scss'

const TABS = [
  { id: 'features', label: 'Permissions' },
  { id: 'distribution', label: 'Distribution' },
  { id: 'history', label: 'Logging' }
]

function FeaturesPane () {
  const [tab, setTab] = useState('features')

  return (
    <div className='FeaturesPane'>
      <div className='FeaturesPane__Tabs' role='tablist'>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type='button'
            role='tab'
            aria-selected={tab === id}
            className={`FeaturesPane__Tab${tab === id ? ' FeaturesPane__Tab--active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className='FeaturesPane__Body'>
        {tab === 'features' && <Features/>}
        {tab === 'distribution' && <Distribution/>}
        {tab === 'history' && <History/>}
      </div>
    </div>
  )
}

export default FeaturesPane
