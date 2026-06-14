'use client'

import { Stack } from '@chakra-ui/react'
import { FeatureToggle } from './FeatureRow'
import { useTokenWizard } from '../TokenWizardContext'

function History () {
  const { form, setField } = useTokenWizard()

  const toggleHistory = (key) => () => {
    setField('keepsHistory', { ...form.keepsHistory, [key]: !form.keepsHistory[key] })
  }

  return (
    <div className='Features'>
      <Stack spacing={2}>
        <FeatureToggle
          label='Record transfers'
          tooltip='Keep a per-transfer record on chain. Audit trail only — does not affect ability to transfer.'
          value={form.keepsHistory.transfer}
          onToggle={toggleHistory('transfer')}
        />
        <FeatureToggle
          label='Record freezes / unfreezes'
          tooltip='Keep freeze and unfreeze events in history. Useful for compliance audits.'
          value={form.keepsHistory.freezing}
          onToggle={toggleHistory('freezing')}
        />
        <FeatureToggle
          label='Record mints'
          tooltip='Keep mint events in history. Helps holders verify supply changes.'
          value={form.keepsHistory.minting}
          onToggle={toggleHistory('minting')}
        />
        <FeatureToggle
          label='Record burns'
          tooltip='Keep burn events in history. Helps verify deflationary actions.'
          value={form.keepsHistory.burning}
          onToggle={toggleHistory('burning')}
        />
        <FeatureToggle
          label='Record direct pricing changes'
          tooltip='Keep a record every time the direct-purchase price is updated by the owner.'
          value={form.keepsHistory.directPricing}
          onToggle={toggleHistory('directPricing')}
        />
        <FeatureToggle
          label='Record direct purchases'
          tooltip='Keep a record of every direct purchase made against the token.'
          value={form.keepsHistory.directPurchase}
          onToggle={toggleHistory('directPurchase')}
        />
      </Stack>
    </div>
  )
}

export default History
