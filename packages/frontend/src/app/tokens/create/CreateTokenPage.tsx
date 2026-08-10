'use client'

import { useState } from 'react'
import { TokenWizardProvider } from './TokenWizardContext'
import FormAccordion from './components/FormAccordion'
import JsonPreview from './components/Preview/JsonPreview'
import DeployBar from './components/DeployBar'
import './CreateTokenPage.scss'
import './components/Preview/Preview.scss'

export type PreviewView = 'json' | 'faq'
export type MobilePane = 'form' | 'preview'

function CreateTokenPage () {
  // Flattened mobile nav (<=960px): one row of Form / JSON / FAQ, no nested tabs.
  // mobilePane picks the visible column; previewView drives the JSON/FAQ view
  // (shared with the desktop in-pane toggle). Ignored on desktop (both columns show).
  const [mobilePane, setMobilePane] = useState<MobilePane>('form')
  const [previewView, setPreviewView] = useState<PreviewView>('json')

  const MOBILE_TABS = [
    { id: 'form', label: 'Form', active: mobilePane === 'form', onClick: () => setMobilePane('form') },
    { id: 'json', label: 'JSON', active: mobilePane === 'preview' && previewView === 'json', onClick: () => { setMobilePane('preview'); setPreviewView('json') } },
    { id: 'faq', label: 'FAQ', active: mobilePane === 'preview' && previewView === 'faq', onClick: () => { setMobilePane('preview'); setPreviewView('faq') } }
  ]

  return (
    <TokenWizardProvider>
      <div className='CreateTokenPage'>
        <div className='CreateTokenPage__MobileTabs' role='tablist'>
          {MOBILE_TABS.map(({ id, label, active, onClick }) => (
            <button
              key={id}
              type='button'
              role='tab'
              aria-selected={active}
              className={`CreateTokenPage__MobileTab${active ? ' CreateTokenPage__MobileTab--active' : ''}`}
              onClick={onClick}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={`CreateTokenPage__Layout CreateTokenPage__Layout--m-${mobilePane}`}>
          <div className='CreateTokenPage__FormPane'>
            <div className='CreateTokenPage__FormScroll'>
              <FormAccordion/>
              <div className='CreateTokenPage__DeployBlock'>
                <DeployBar/>
              </div>
            </div>
          </div>
          <div className='CreateTokenPage__PreviewPane'>
            <JsonPreview view={previewView} onViewChange={setPreviewView}/>
          </div>
        </div>
      </div>
    </TokenWizardProvider>
  )
}

export default CreateTokenPage
