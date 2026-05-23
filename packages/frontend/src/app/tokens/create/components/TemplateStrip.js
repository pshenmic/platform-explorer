'use client'

import { TEMPLATES } from '../templates'
import { useTokenWizard } from '../TokenWizardContext'
import './TemplateStrip.scss'

function TemplateStrip () {
  const { form, selectTemplate } = useTokenWizard()

  return (
    <div className='TemplateStrip'>
      {TEMPLATES.map((template) => {
        const isActive = form.template === template.id
        const className = [
          'TemplateStrip__Card',
          isActive ? 'TemplateStrip__Card--Active' : '',
          template.disabled ? 'TemplateStrip__Card--Disabled' : ''
        ].filter(Boolean).join(' ')

        return (
          <button
            type='button'
            key={template.id}
            className={className}
            onClick={() => selectTemplate(template.id)}
            disabled={template.disabled}
          >
            <div className='TemplateStrip__CardTitle'>
              {template.label}
              {template.disabled && <span className='TemplateStrip__SoonBadge'>soon</span>}
            </div>
            <div className='TemplateStrip__CardDescription'>{template.description}</div>
          </button>
        )
      })}
    </div>
  )
}

export default TemplateStrip
