import { Button } from '@chakra-ui/react'

export default function SubmitButton ({ onSubmit }) {
  return (
    <Button
      size={'sm'}
      variant={'customGreen'}
      onClick={() => {
        if (typeof onSubmit === 'function') onSubmit()
      }}
    >
      OK
    </Button>
  )
}
