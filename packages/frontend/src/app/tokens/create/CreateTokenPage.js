'use client'

import { TokenWizardProvider } from './TokenWizardContext'
import TemplateStrip from './components/TemplateStrip'
import Essentials from './components/Essentials'
import Features from './components/Features'
import PlainEnglishSummary from './components/Preview/PlainEnglishSummary'
import JsonPreview from './components/Preview/JsonPreview'
import DeployBar from './components/DeployBar'
import './CreateTokenPage.scss'
import './components/Preview/Preview.scss'

function CreateTokenPage () {
  return (
    <TokenWizardProvider>
      <div className='CreateTokenPage'>
        <div className='CreateTokenPage__Layout'>
          <div className='CreateTokenPage__FormPane'>
            <div className='CreateTokenPage__SectionTitle'>Template</div>
            <TemplateStrip/>

            <div className='CreateTokenPage__SectionTitle'>Essentials</div>
            <Essentials/>

            <div className='CreateTokenPage__SectionTitle'>Features</div>
            <Features/>

            <div className='CreateTokenPage__SectionTitle'>Deploy</div>
            <DeployBar/>
          </div>
          <div className='CreateTokenPage__PreviewPane'>
            <PlainEnglishSummary/>
            <JsonPreview/>
          </div>
        </div>
      </div>
    </TokenWizardProvider>
  )
}

export default CreateTokenPage
