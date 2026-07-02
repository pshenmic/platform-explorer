import { DeleteIcon } from '@chakra-ui/icons'
import { Button } from '@chakra-ui/react'
import type { ButtonProps } from '@chakra-ui/react'

const SIZE = {
  lg: {
    btn: { padding: '10px 20px', width: '10', height: '10' },
    icon: { width: '3.5', height: '3.5' }
  },
  md: {
    btn: { padding: '7px 10px', minWidth: '8', width: '8', minHeight: '6', height: '6' },
    icon: { width: '2.5', height: '2.5' }
  }
}

interface TrashButtonProps extends Omit<ButtonProps, 'size'> {
  size?: keyof typeof SIZE
}

export const TrashButton = ({ size = 'lg', ...props }: TrashButtonProps) => (
  <Button
    borderRadius={'10px'}
    bgColor={'#F4585833'}
    _hover={{
      bgColor: '#F45858'
    }}
    {...SIZE[size].btn}
    {...props}
  >
    <DeleteIcon {...SIZE[size].icon} />
  </Button>
)
