'use client'

import {
  FormControl, FormLabel, Input, InputGroup, InputRightElement, Checkbox, Stack, SimpleGrid
} from '@chakra-ui/react'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import { useTokenWizard } from '../TokenWizardContext'
import { Tooltip } from '../../../../components/ui/Tooltips'
import './Essentials.scss'

const HelpIcon = ({ tooltip }) => (
  <Tooltip content={tooltip}>
    <span><InfoOutlineIcon boxSize={3} color='gray.400' cursor='help'/></span>
  </Tooltip>
)

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
              <HelpIcon tooltip='Short label shown to users wherever your token appears (wallets, explorers, marketplaces).'/>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
          <FormControl>
            <FormLabel className='Essentials__Label'>Base supply</FormLabel>
            <InputGroup size='sm'>
              <Input
                variant='filled'
                placeholder='1000000'
                value={form.baseSupply}
                onChange={onDigitsChange('baseSupply')}
                fontFamily='mono'
                inputMode='numeric'
              />
              <InputRightElement>
                <HelpIcon tooltip='Total tokens minted now. They go to your identity and you can transfer or mint more later if minting is enabled.'/>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <FormControl>
            <Stack direction='row' align='center' justify='space-between' mb={1}>
              <FormLabel className='Essentials__Label' mb={0}>Max supply</FormLabel>
              <Checkbox
                size='sm'
                isChecked={form.hasMaxSupply}
                onChange={(e) => setField('hasMaxSupply', e.target.checked)}
              >
                Cap
              </Checkbox>
            </Stack>
            <InputGroup size='sm'>
              <Input
                variant='filled'
                placeholder={form.hasMaxSupply ? '10000000' : 'Unlimited'}
                value={form.maxSupply}
                onChange={onDigitsChange('maxSupply')}
                fontFamily='mono'
                inputMode='numeric'
                isDisabled={!form.hasMaxSupply}
              />
              <InputRightElement>
                <HelpIcon tooltip='Hard cap on total tokens that can ever exist. Tick "Cap" to set a limit.'/>
              </InputRightElement>
            </InputGroup>
          </FormControl>
        </SimpleGrid>
      </Stack>
    </div>
  )
}

export default Essentials
