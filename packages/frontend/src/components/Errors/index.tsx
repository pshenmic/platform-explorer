import { WarningTwoIcon } from '@chakra-ui/icons'
import { Flex } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface ErrorMessageBlockProps {
  w?: string | number
  h?: string | number
  text?: ReactNode
  warningIcon?: boolean
}

function ErrorMessageBlock({
  w = '100%',
  h = '100%',
  text,
  warningIcon = true
}: ErrorMessageBlockProps) {
  return (
    <Flex
      flexGrow={1}
      w={w}
      h={h}
      justifyContent={'center'}
      alignItems={'center'}
      flexDirection={'column'}
      opacity={0.5}
    >
      <div>
        {warningIcon && <WarningTwoIcon color={'#ddd'} mr={2} mt={-1} />}
        {text || 'Error loading data'}
      </div>
    </Flex>
  )
}

export { ErrorMessageBlock }
