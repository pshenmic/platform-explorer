'use client'

import { Stack, Input } from '@chakra-ui/react'
import { Row } from './AdvancedRow'
import { FeatureToggle } from './FeatureRow'
import History from './History'
import { useTokenWizard } from '../TokenWizardContext'

// "Advanced" mirrors the official Dash Evo Tool bucket: less-common token
// config (decimals, capitalization, paused state, transfer-to-frozen) plus the
// on-chain history flags. Kept together so Action Rules stays just the rules.
function Advanced () {
  const { form, setField } = useTokenWizard()
  const toggle = (key) => () => setField(key, !form[key])

  // DPP caps decimals at 16. Empty allowed mid-typing (treated as 0 on build).
  const onDecimalsChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '')
    if (digits === '') return setField('decimals', '')
    setField('decimals', Math.min(16, Number(digits)))
  }

  return (
    <div className='Features'>
      <Stack spacing={3}>
        <Row
          label='Decimals'
          tooltip='How many fractional digits the token supports (like cents). Max 16. DASH itself uses 8. Your supply inputs are multiplied by 10^decimals on chain.'
        >
          <Input
            size='sm'
            variant='filled'
            placeholder='8'
            value={form.decimals}
            onChange={onDecimalsChange}
            fontFamily='mono'
            inputMode='numeric'
            width='80px'
          />
        </Row>
        <FeatureToggle
          label='Capitalize singular form'
          tooltip='Hints that the token name should be rendered capitalized in clients (e.g. MyToken, not mytoken). Metadata only.'
          value={form.shouldCapitalize}
          onToggle={toggle('shouldCapitalize')}
        />
        <FeatureToggle
          label='Start paused'
          tooltip='Token is created in a paused state. Owner must unpause before transfers work.'
          value={form.startAsPaused}
          onToggle={toggle('startAsPaused')}
        />
        <FeatureToggle
          label='Allow transfer to frozen balance'
          tooltip='If on, mints and transfers can land on a balance that is currently frozen. Off bounces them.'
          value={form.allowTransferToFrozenBalance}
          onToggle={toggle('allowTransferToFrozenBalance')}
        />
        <History/>
      </Stack>
    </div>
  )
}

export default Advanced
