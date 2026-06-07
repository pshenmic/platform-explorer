'use client'

import { useTokenWizard } from '../TokenWizardContext'
import { TEMPLATES } from '../templates'
import { PRESET_ICONS } from './PresetIcons'
import './PresetStrip.scss'

// Entry point of the form: a horizontal strip of preset cards. One is selected
// by default (Utility) so the form is never an intimidating blank slate. Cards
// only seed defaults — every field stays editable. "Custom" is a quiet escape
// hatch for power users who want to start from the current state untouched.
function PresetStrip () {
  const { form, selectTemplate } = useTokenWizard()

  return (
    <div className='PresetStrip'>
      <div className='PresetStrip__Cards' role='radiogroup' aria-label='Token preset'>
        {TEMPLATES.map((t) => {
          const Icon = PRESET_ICONS[t.icon]
          const active = form.template === t.id
          return (
            <button
              key={t.id}
              type='button'
              role='radio'
              aria-checked={active}
              title={t.description}
              className={`PresetStrip__Card${active ? ' PresetStrip__Card--active' : ''}`}
              onClick={() => selectTemplate(t.id)}
            >
              <span className='PresetStrip__Icon'>{Icon && <Icon/>}</span>
              <span className='PresetStrip__Label'>{t.label}</span>
            </button>
          )
        })}
      </div>
      <button
        type='button'
        className={`PresetStrip__Custom${form.template === 'custom' ? ' PresetStrip__Custom--active' : ''}`}
        onClick={() => selectTemplate('custom')}
      >
        Custom — start from scratch
      </button>
    </div>
  )
}

export default PresetStrip
