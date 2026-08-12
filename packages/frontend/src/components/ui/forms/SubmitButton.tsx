import { Button } from '@chakra-ui/react'
import type { ButtonProps } from '@chakra-ui/react'

interface SubmitButtonProps extends ButtonProps {
  onSubmit?: () => void
  text?: string
}

export default function SubmitButton({ onSubmit, text, children, ...props }: SubmitButtonProps) {
  return (
    <Button
      className={'SubmitButton'}
      size={'sm'}
      variant={'customGreen'}
      onClick={() => {
        if (typeof onSubmit === 'function') onSubmit()
      }}
      {...props}
    >
      {children || text || 'OK'}
    </Button>
  )
}
