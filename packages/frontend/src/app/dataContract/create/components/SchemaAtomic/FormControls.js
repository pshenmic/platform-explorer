import { Button, Grid } from '@chakra-ui/react'
import { ImportIcon, CloseIcon } from '@components/ui/icons'

export const FormControls = () => {
  return (
    <Grid templateColumns='repeat(4, 1fr)' gap={2}>
      <Button leftIcon={
        <ImportIcon />
      }
        variant='blue'
      >
        Import
      </Button>
      <Button
        variant='blue'
      >
        Compact
      </Button>
      <Button
        variant='blue'
      >
        Validate
      </Button>
      <Button leftIcon={<CloseIcon />}
        variant='red'
      >
        Clear
      </Button>
    </Grid>
  )
}
