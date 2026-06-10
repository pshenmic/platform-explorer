'use client'

import { useState } from 'react'
import {
  FormControl, Input, FormHelperText, Textarea, Stack, HStack, Text,
  Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody
} from '@chakra-ui/react'
import { YesNoBadge } from './FeatureRow'
import { useTokenWizard } from '../TokenWizardContext'
import './Essentials.scss'

// DPP caps name at 3–25 bytes and rejects whitespace/control chars.
// ASCII letters/digits keep maxLength byte-accurate and pluralization sane.
const sanitizeName = (s) => s.replace(/[^A-Za-z0-9]/g, '')

const nameHint = (value) => {
  if (value && value.length < 3) return 'At least 3 characters'
  return null
}

const FieldLabel = ({ label, tooltip, rightSlot }) => (
  <HStack className='Essentials__LabelRow' justify='space-between' spacing={3}>
    <Popover trigger='click' placement='top' isLazy>
      <PopoverTrigger>
        <Text
          as='button'
          type='button'
          className='Essentials__Label'
        >
          {label}
        </Text>
      </PopoverTrigger>
      <PopoverContent maxW='320px' fontSize='0.75rem' fontFamily='var(--font-body)'>
        <PopoverArrow/>
        <PopoverBody>{tooltip}</PopoverBody>
      </PopoverContent>
    </Popover>
    {rightSlot}
  </HStack>
)

function Essentials () {
  const { form, setField } = useTokenWizard()
  const [touched, setTouched] = useState({ name: false })

  const markTouched = (key) => () => setTouched((t) => ({ ...t, [key]: true }))

  const onNameChange = (e) => {
    const next = sanitizeName(e.target.value)
    setField('name', next)
    // Plural auto-derives from singular; manual edits only via JSON tab.
    if (!form.pluralEdited) {
      setField('pluralForm', next ? `${next}s` : '')
    }
  }

  // Show hint only after blur — don't flag while user is still typing.
  const nameError = touched.name ? nameHint(form.name) : null

  const onDigitsChange = (key) => (e) => {
    const next = e.target.value.replace(/\D/g, '')
    setField(key, next)
  }

  const toggle = (key) => () => setField(key, !form[key])

  return (
    <div className='Essentials'>
      <Stack spacing={4}>
        <FormControl isInvalid={!!nameError}>
          <FieldLabel
            label='Token name'
            tooltip='Display name (singular). 3–25 ASCII letters or digits, no spaces. Used as singularForm in the English localization. The plural form is auto-derived (name + s); customize it via the JSON tab if your name does not pluralize with -s.'
          />
          <Input
            size='sm'
            variant='filled'
            placeholder='Singular, e.g. MyToken (3–25, no spaces)'
            value={form.name}
            onChange={onNameChange}
            onBlur={markTouched('name')}
            fontFamily='mono'
            maxLength={25}
            width='100%'
          />
          {nameError && <FormHelperText className='Essentials__Hint'>{nameError}</FormHelperText>}
        </FormControl>

        <FormControl>
          <FieldLabel
            label='Description'
            tooltip='Optional human-readable description shown on the token page. Up to 256 characters. Stored as description in the contract.'
          />
          <Textarea
            size='sm'
            variant='filled'
            placeholder='Optional notes shown on the token page (e.g. what the token is for).'
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            fontFamily='mono'
            rows={3}
            maxLength={256}
            width='100%'
          />
        </FormControl>

        <FormControl>
          <FieldLabel
            label='Base supply'
            tooltip='Total tokens minted now. They go to your identity and you can transfer or mint more later if minting is enabled.'
          />
          <Input
            size='sm'
            variant='filled'
            placeholder='1000000'
            value={form.baseSupply}
            onChange={onDigitsChange('baseSupply')}
            fontFamily='mono'
            inputMode='numeric'
            width='100%'
          />
        </FormControl>

        <FormControl>
          <FieldLabel
            label='Max supply'
            tooltip='Hard cap on total tokens that can ever exist. Toggle on to set a limit; leave off for unlimited.'
            rightSlot={<YesNoBadge value={form.hasMaxSupply} onToggle={toggle('hasMaxSupply')}/>}
          />
          <Input
            size='sm'
            variant='filled'
            placeholder={form.hasMaxSupply ? '10000000' : 'Unlimited'}
            value={form.maxSupply}
            onChange={onDigitsChange('maxSupply')}
            fontFamily='mono'
            inputMode='numeric'
            isDisabled={!form.hasMaxSupply}
            width='100%'
          />
        </FormControl>
      </Stack>
    </div>
  )
}

export default Essentials
