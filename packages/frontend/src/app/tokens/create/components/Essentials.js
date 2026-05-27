'use client'

import { useState } from 'react'
import {
  FormControl, FormLabel, Input, FormHelperText, Textarea, Stack
} from '@chakra-ui/react'
import { useTokenWizard } from '../TokenWizardContext'
import './Essentials.scss'

// DPP rejects whitespace + control chars in token name forms and caps length
// at 3–25 bytes. We restrict to ASCII letters/digits so maxLength maps 1:1 to
// the byte limit and the auto-pluralization stays sane.
const sanitizeName = (s) => s.replace(/[^A-Za-z0-9]/g, '')

const nameHint = (value) => {
  if (value && value.length < 3) return 'At least 3 characters'
  return null
}

function Essentials () {
  const { form, setField } = useTokenWizard()
  const [touched, setTouched] = useState({ name: false, pluralForm: false })

  const markTouched = (key) => () => setTouched((t) => ({ ...t, [key]: true }))

  const onNameChange = (e) => {
    const next = sanitizeName(e.target.value)
    setField('name', next)
    // Auto-suggest plural from singular until the user edits the plural field.
    if (!form.pluralEdited) {
      setField('pluralForm', next ? `${next}s` : '')
    }
  }

  const onPluralChange = (e) => {
    setField('pluralForm', sanitizeName(e.target.value))
    setField('pluralEdited', true)
  }

  // Show the hint only after the field is blurred — avoids flagging while
  // the user is still typing (2026 validate-on-blur practice).
  const nameError = touched.name ? nameHint(form.name) : null
  const pluralError = touched.pluralForm ? nameHint(form.pluralForm) : null

  return (
    <div className='Essentials'>
      <Stack spacing={4}>
        <FormControl isInvalid={!!nameError}>
          <FormLabel className='Essentials__Label'>Token name</FormLabel>
          <Input
            size='sm'
            variant='filled'
            placeholder='Singular, e.g. MyToken (3–25, no spaces)'
            value={form.name}
            onChange={onNameChange}
            onBlur={markTouched('name')}
            fontFamily='mono'
            maxLength={25}
          />
          {nameError && <FormHelperText className='Essentials__Hint'>{nameError}</FormHelperText>}
        </FormControl>

        <FormControl isInvalid={!!pluralError}>
          <FormLabel className='Essentials__Label'>Plural form</FormLabel>
          <Input
            size='sm'
            variant='filled'
            placeholder='Plural, auto-filled from name (e.g. MyTokens)'
            value={form.pluralForm}
            onChange={onPluralChange}
            onBlur={markTouched('pluralForm')}
            fontFamily='mono'
            maxLength={25}
          />
          {pluralError && <FormHelperText className='Essentials__Hint'>{pluralError}</FormHelperText>}
        </FormControl>

        <FormControl>
          <FormLabel className='Essentials__Label'>Description</FormLabel>
          <Textarea
            size='sm'
            variant='filled'
            placeholder='Optional notes shown on the token page (e.g. what the token is for).'
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            fontFamily='mono'
            rows={3}
            maxLength={256}
          />
        </FormControl>
      </Stack>
    </div>
  )
}

export default Essentials
