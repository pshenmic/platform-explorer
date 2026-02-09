import { DeleteIcon } from '@chakra-ui/icons'
import { Button } from '@chakra-ui/react'

export const TrashButton = (props) => (
    <Button
        padding={'10px 20px'}
        width={'10'}
        height={'10'}
        borderRadius={'10px'}
        bgColor={'#F4585833'}
        _hover={{
          bgColor: '#F45858'
        }}
        {...props}
    >
        <DeleteIcon
            width={'3.5'}
            height={'3.5'}
        />
    </Button>
)
