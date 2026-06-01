'use client'

import { Stack } from '@chakra-ui/react'
import { FeatureToggle } from './FeatureRow'
import { useTokenWizard } from '../TokenWizardContext'
import './Features.scss'

function Features () {
  const { form, setField } = useTokenWizard()

  const toggle = (key) => () => setField(key, !form[key])

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
        <FeatureToggle
          label='Allow transfer to frozen balance'
          tooltip='If on, mints and transfers can land on a balance that is currently frozen. Off bounces them.'
          value={form.allowTransferToFrozenBalance}
          onToggle={toggle('allowTransferToFrozenBalance')}
        />
      </Stack>
    </div>
  )
}

export default Features
