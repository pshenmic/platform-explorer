'use client'

import { TokenWizardProvider } from './TokenWizardContext'
import FormAccordion from './components/FormAccordion'
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
            <div className='CreateTokenPage__FormScroll'>
              <FormAccordion/>
              <div className='CreateTokenPage__DeployBlock'>
                <DeployBar/>
              </div>
            </div>
          </div>
          <div className='CreateTokenPage__PreviewPane'>
            <JsonPreview/>
          </div>
        </div>
      </div>
    </TokenWizardProvider>
  )
}

export default CreateTokenPage
