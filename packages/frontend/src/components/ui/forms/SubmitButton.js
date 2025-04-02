import { Button } from '@chakra-ui/react'

export default function SubmitButton ({ onSubmit, text, children, ...props }) {
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
