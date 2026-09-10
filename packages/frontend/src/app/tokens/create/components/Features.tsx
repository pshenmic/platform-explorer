'use client'

import { Stack } from '@chakra-ui/react'
import { FeatureToggle } from './FeatureRow'
import { useTokenWizard } from '../TokenWizardContext'
import type { TokenForm } from '../TokenWizardContext'
import './Features.css'

type BooleanFormKey = {
  [K in keyof TokenForm]: TokenForm[K] extends boolean ? K : never
}[keyof TokenForm]

function Features () {
  const { form, setField } = useTokenWizard()

  const toggle = (key: BooleanFormKey) => () => setField(key, !form[key])

  return (
    <div className='Features'>
      <Stack spacing={2}>
        <FeatureToggle
          label='Mintable'
          tooltip='Owner can mint more tokens later. Disable to lock the initial supply.'
          value={form.allowMint}
          onToggle={toggle('allowMint')}
        />
        <FeatureToggle
          label='Burnable'
          tooltip='Owner can burn tokens. Useful for redemption or deflationary models.'
          value={form.allowBurn}
          onToggle={toggle('allowBurn')}
        />
        <FeatureToggle
          label='Freezable'
          tooltip='Owner can freeze and unfreeze holder balances. Useful for anti-fraud or compliance.'
          value={form.allowFreeze}
          onToggle={toggle('allowFreeze')}
        />
        <FeatureToggle
          label='Burn frozen funds'
          tooltip='Owner can destroy tokens that are currently frozen. Only meaningful when Freezable is on.'
          value={form.allowDestroyFrozen}
          onToggle={toggle('allowDestroyFrozen')}
        />
        <FeatureToggle
          label='Emergency pause'
          tooltip='Owner can pause all token operations in an emergency.'
          value={form.allowEmergency}
          onToggle={toggle('allowEmergency')}
        />
      </Stack>
    </div>
  )
}

export default Features
