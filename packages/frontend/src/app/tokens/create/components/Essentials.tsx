'use client'

import { useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import {
  FormControl, Input, FormHelperText, Textarea, Stack, HStack, Text,
  Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody
} from '@chakra-ui/react'
import { YesNoBadge } from './FeatureRow'
import { useTokenWizard } from '../TokenWizardContext'
import type { TokenForm } from '../TokenWizardContext'
import './Essentials.scss'

// DPP caps name at 3–25 bytes and rejects whitespace/control chars.
// ASCII letters/digits keep maxLength byte-accurate and pluralization sane.
const sanitizeName = (s: string): string => s.replace(/[^A-Za-z0-9]/g, '')

const nameHint = (value: string): string | null => {
  if (value && value.length < 3) return 'At least 3 characters'
  return null
}

interface FieldLabelProps {
  label: ReactNode
  tooltip: ReactNode
  rightSlot?: ReactNode
}

const FieldLabel = ({ label, tooltip, rightSlot }: FieldLabelProps) => (
  <HStack className='Essentials__LabelRow' justify='space-between' spacing={3}>
    <Popover trigger='click' placement='top' isLazy>
      <PopoverTrigger>
        <Text
          as='button'
          className='Essentials__Label'
          // Chakra polymorphic `as` does not narrow props under React 19 types
          {...({ type: 'button' } as object)}
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

type BooleanFormKey = {
  [K in keyof TokenForm]: TokenForm[K] extends boolean ? K : never
}[keyof TokenForm]

function Essentials () {
  const { form, setField } = useTokenWizard()
  const [touched, setTouched] = useState<{ name: boolean }>({ name: false })

  const markTouched = (key: 'name') => () => setTouched((t) => ({ ...t, [key]: true }))

  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = sanitizeName(e.target.value)
    setField('name', next)
    // Plural auto-derives from singular; manual edits only via JSON tab.
    if (!form.pluralEdited) {
      setField('pluralForm', next ? `${next}s` : '')
    }
  }

  // Show hint only after blur — don't flag while user is still typing.
  const nameError = touched.name ? nameHint(form.name) : null

  const onDigitsChange = (key: 'baseSupply' | 'maxSupply') => (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/\D/g, '')
    setField(key, next)
  }

  const toggle = (key: BooleanFormKey) => () => setField(key, !form[key])

  return (
    <div className='Essentials'>
      <Stack spacing={4}>
        <FormControl isInvalid={!!nameError}>
          <FieldLabel
            label='Token name'
            tooltip='Singular display name. 3–25 letters or digits, no spaces.'
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
            tooltip='Optional note shown on the token page. Up to 256 characters.'
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
            tooltip='Tokens minted to you now. Mint more later if minting is on.'
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
            tooltip='Hard cap on tokens that can ever exist. Off = unlimited.'
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
