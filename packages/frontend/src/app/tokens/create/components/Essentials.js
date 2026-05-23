'use client'

import { FormControl, FormLabel, Input, Checkbox, Stack } from '@chakra-ui/react'
import { useTokenWizard } from '../TokenWizardContext'
import './Essentials.scss'

function Essentials () {
  const { form, setField } = useTokenWizard()

  const onDigitsChange = (key) => (e) => {
    const next = e.target.value.replace(/\D/g, '')
    setField(key, next)
  }

  return (
    <div className='Essentials'>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel className='Essentials__Label'>Token name</FormLabel>
          <Input
            size='sm'
            variant='filled'
            placeholder='MyToken'
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            fontFamily='mono'
            maxLength={64}
          />
        </FormControl>

        <FormControl>
          <FormLabel className='Essentials__Label'>Decimals</FormLabel>
          <Input
            size='sm'
            variant='filled'
            type='number'
            min={0}
            max={18}
            value={form.decimals}
            onChange={(e) => setField('decimals', e.target.value)}
            fontFamily='mono'
          />
        </FormControl>

        <FormControl>
          <FormLabel className='Essentials__Label'>Base supply</FormLabel>
          <Input
            size='sm'
            variant='filled'
            placeholder='1000000'
            value={form.baseSupply}
            onChange={onDigitsChange('baseSupply')}
            fontFamily='mono'
            inputMode='numeric'
          />
        </FormControl>

        <FormControl>
          <Stack direction='row' align='center' justify='space-between'>
            <FormLabel className='Essentials__Label' mb={0}>Max supply</FormLabel>
            <Checkbox
              size='sm'
              isChecked={form.hasMaxSupply}
              onChange={(e) => setField('hasMaxSupply', e.target.checked)}
            >
              Cap supply
            </Checkbox>
          </Stack>
          {form.hasMaxSupply && (
            <Input
              size='sm'
              variant='filled'
              placeholder='10000000'
              value={form.maxSupply}
              onChange={onDigitsChange('maxSupply')}
              fontFamily='mono'
              inputMode='numeric'
              mt={2}
            />
          )}
        </FormControl>
      </Stack>
    </div>
  )
}

export default Essentials
