'use client'

import {
  FormControl, FormLabel, Input, InputGroup, InputRightElement, Textarea, Stack
} from '@chakra-ui/react'
import { useTokenWizard } from '../TokenWizardContext'
import HelpPopover from './HelpPopover'
import './Essentials.scss'

function Essentials () {
  const { form, setField } = useTokenWizard()

  return (
    <div className='Essentials'>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel className='Essentials__Label'>Token name</FormLabel>
          <InputGroup size='sm'>
            <Input
              variant='filled'
              placeholder='MyToken'
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              fontFamily='mono'
              maxLength={64}
            />
            <InputRightElement>
              <HelpPopover>
                Short label shown to users wherever your token appears (wallets, explorers, marketplaces).
              </HelpPopover>
            </InputRightElement>
          </InputGroup>
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
