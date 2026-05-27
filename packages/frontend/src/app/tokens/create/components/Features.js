'use client'

import { Switch, HStack, Stack, Input, Text } from '@chakra-ui/react'
import { useTokenWizard } from '../TokenWizardContext'
import HelpPopover from './HelpPopover'
import './Features.scss'

const RowLabel = ({ label, tooltip, width }) => (
  <HStack spacing={2} align='center' width={width} flexShrink={0}>
    <HelpPopover>{tooltip}</HelpPopover>
    <Text fontSize='12px' fontFamily='mono' color='var(--chakra-colors-white-100)'>
      {label}
    </Text>
  </HStack>
)

const FeatureToggle = ({ label, tooltip, isChecked, onChange }) => (
  <HStack className='Features__Row' justify='space-between' spacing={3}>
    <RowLabel label={label} tooltip={tooltip}/>
    <Switch size='sm' isChecked={isChecked} onChange={onChange}/>
  </HStack>
)

function Features () {
  const { form, setField } = useTokenWizard()

  const onDigitsChange = (key) => (e) => {
    const next = e.target.value.replace(/\D/g, '')
    setField(key, next)
  }

  // DPP caps decimals at 16. Empty allowed mid-typing (treated as 0 on build).
  const onDecimalsChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '')
    if (digits === '') return setField('decimals', '')
    setField('decimals', Math.min(16, Number(digits)))
  }

  const setSwitch = (key) => (e) => setField(key, e.target.checked)

  return (
    <div className='Features'>
      <Stack spacing={2}>
        {/* Operations */}
        <FeatureToggle
          label='Mintable'
          tooltip='Owner can mint more tokens later. Disable to lock the initial supply.'
          isChecked={form.allowMint}
          onChange={setSwitch('allowMint')}
        />
        <FeatureToggle
          label='Burnable'
          tooltip='Owner can burn tokens. Useful for redemption or deflationary models.'
          isChecked={form.allowBurn}
          onChange={setSwitch('allowBurn')}
        />
        <FeatureToggle
          label='Allow direct purchase'
          tooltip='Owner can set a price and accept direct purchases from holders.'
          isChecked={form.allowDirectPurchase}
          onChange={setSwitch('allowDirectPurchase')}
        />

        {/* Lifecycle */}
        <FeatureToggle
          label='Start paused'
          tooltip='Token is created in a paused state. Owner must unpause before transfers work.'
          isChecked={form.startAsPaused}
          onChange={setSwitch('startAsPaused')}
        />

        {/* Admin / safety */}
        <FeatureToggle
          label='Freezable'
          tooltip='Owner can freeze and unfreeze holder balances. Useful for anti-fraud or compliance.'
          isChecked={form.allowFreeze}
          onChange={setSwitch('allowFreeze')}
        />
        <FeatureToggle
          label='Burn frozen funds'
          tooltip='Owner can destroy tokens that are currently frozen. Requires Freezable.'
          isChecked={form.allowDestroyFrozen}
          onChange={setSwitch('allowDestroyFrozen')}
        />
        <FeatureToggle
          label='Emergency pause'
          tooltip='Owner can pause all token operations in an emergency.'
          isChecked={form.allowEmergency}
          onChange={setSwitch('allowEmergency')}
        />

        {/* Supply */}
        <HStack className='Features__Row' justify='space-between' spacing={3}>
          <HStack spacing={3}>
            <RowLabel
              label='Decimals'
              width='120px'
              tooltip='How many fractional digits the token supports (like cents). Max 16. DASH itself uses 8. Your supply inputs are multiplied by 10^decimals on chain.'
            />
            <Input
              size='xs'
              variant='filled'
              placeholder='8'
              value={form.decimals}
              onChange={onDecimalsChange}
              fontFamily='mono'
              inputMode='numeric'
              width='160px'
            />
          </HStack>
        </HStack>

        <HStack className='Features__Row' justify='space-between' spacing={3}>
          <HStack spacing={3}>
            <RowLabel
              label='Base supply'
              width='120px'
              tooltip='Total tokens minted now. They go to your identity and you can transfer or mint more later if minting is enabled.'
            />
            <Input
              size='xs'
              variant='filled'
              placeholder='1000000'
              value={form.baseSupply}
              onChange={onDigitsChange('baseSupply')}
              fontFamily='mono'
              inputMode='numeric'
              width='160px'
            />
          </HStack>
        </HStack>

        <HStack className='Features__Row' justify='space-between' spacing={3}>
          <HStack spacing={3}>
            <RowLabel
              label='Max supply'
              width='120px'
              tooltip='Hard cap on total tokens that can ever exist. Toggle on to set a limit; leave off for unlimited.'
            />
            <Input
              size='xs'
              variant='filled'
              placeholder={form.hasMaxSupply ? '10000000' : 'Unlimited'}
              value={form.maxSupply}
              onChange={onDigitsChange('maxSupply')}
              fontFamily='mono'
              inputMode='numeric'
              isDisabled={!form.hasMaxSupply}
              width='160px'
            />
          </HStack>
          <Switch
            size='sm'
            isChecked={form.hasMaxSupply}
            onChange={setSwitch('hasMaxSupply')}
          />
        </HStack>
      </Stack>
    </div>
  )
}

export default Features
