import type { ButtonHTMLAttributes, MouseEvent } from 'react'
import './SubmitButton.css'

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onSubmit?: () => void
  text?: string
  isDisabled?: boolean
  variant?: 'customGreen' | 'brand' | 'blue' | 'gray'
  size?: 'xxs' | 'sm' | 'md'
}

export default function SubmitButton({
  onSubmit,
  text,
  children,
  className,
  onClick,
  isDisabled,
  disabled,
  variant = 'customGreen',
  size = 'sm',
  type = 'button',
  ...props
}: SubmitButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (typeof onSubmit === 'function') onSubmit()
  }

  return (
    <button
      type={type}
      className={`SubmitButton SubmitButton--${size} SubmitButton--${variant} ${className || ''}`}
      onClick={handleClick}
      disabled={disabled ?? isDisabled}
      {...props}
    >
      {children || text || 'OK'}
    </button>
  )
}
