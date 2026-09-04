import type { ButtonHTMLAttributes } from 'react'
import './TrashButton.css'

interface TrashButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'lg' | 'md'
}

function DeleteIcon() {
  return (
    <svg className={'TrashButton__Icon'} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  )
}

export const TrashButton = ({ size = 'lg', className, type = 'button', ...props }: TrashButtonProps) => (
  <button type={type} className={`TrashButton TrashButton--${size} ${className || ''}`} {...props}>
    <DeleteIcon />
  </button>
)
