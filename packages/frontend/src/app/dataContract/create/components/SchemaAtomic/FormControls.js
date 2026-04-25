import { Button, Flex } from '@chakra-ui/react'
import { CloseIcon } from '@components/ui/icons'
import { useSchema } from '../../SchemaProvider'

export const FormControls = () => {
  const { value, error: schemaError, handleChange, handleReset } = useSchema()

  const handleFormat = () => {
    try {
      handleChange(JSON.stringify(JSON.parse(value), null, 2))
    } catch {
      // JSON invalid — error shown separately, nothing to format
    }
  }

  return (
    <Flex gap={2} align='center' wrap='wrap'>
      <Button variant='blue' size='sm' onClick={handleFormat} isDisabled={schemaError != null}>
        Format
      </Button>
      <Button leftIcon={<CloseIcon />} variant='red' size='sm' onClick={handleReset}>
        Reset
      </Button>
    </Flex>
  )
}
