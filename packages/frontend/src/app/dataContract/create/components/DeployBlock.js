import { Button, Flex, Select, Text } from '@chakra-ui/react'

export const DeployBlock = () => {
  return (
    <Flex direction='column' gap={4} p={4}>
      <Flex direction='column' gap={2}>
        <Text fontSize='sm' fontWeight='bold'>Method</Text>
        <Select defaultValue='extension'>
          <option value='extension'>Extension signer</option>
          <option value='privateKey' disabled>Private key (coming soon)</option>
        </Select>
      </Flex>
      <Button variant='blue' isDisabled>
        Deploy Contract
      </Button>
      <Text fontSize='xs' color='gray.500'>
        Deploy flow is under development. Extension signer integration coming next.
      </Text>
    </Flex>
  )
}
