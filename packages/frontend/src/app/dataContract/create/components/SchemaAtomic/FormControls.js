import { Button, Flex, Link } from '@chakra-ui/react'
import { CloseIcon } from '@components/ui/icons'
import { useSchema } from '../../SchemaProvider'

const DOCS_URL = 'https://docs.dash.org/projects/platform/en/stable/docs/explanations/platform-protocol-data-contract.html'

export const FormControls = () => {
  const { error, handleChange } = useSchema()

  const handleClear = () => handleChange('')

  return (
    <Flex gap={2} align='center' wrap='wrap'>
      <Button variant='blue' isDisabled={error != null}>
        Validate
      </Button>
      <Button leftIcon={<CloseIcon />} variant='red' onClick={handleClear}>
        Clear
      </Button>
      <Link href={DOCS_URL} isExternal fontSize='sm' ml='auto'>
        Data Contract docs →
      </Link>
    </Flex>
  )
}
