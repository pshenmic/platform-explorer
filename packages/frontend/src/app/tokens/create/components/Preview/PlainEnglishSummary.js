'use client'

import { useMemo } from 'react'
import { useTokenWizard } from '../../TokenWizardContext'
import { buildSummary } from '../../buildSummary'

function PlainEnglishSummary () {
  const { form } = useTokenWizard()
  const bullets = useMemo(() => buildSummary(form), [form])

  return (
    <div className='Preview__Summary'>
      <div className='Preview__SummaryTitle'>What this token does</div>
      <ul className='Preview__SummaryList'>
        {bullets.map((line, i) => (
          <li key={i} className='Preview__SummaryItem'>{line}</li>
        ))}
      </ul>
    </div>
  )
}

export default PlainEnglishSummary
