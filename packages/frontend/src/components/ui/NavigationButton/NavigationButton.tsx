import type { ComponentProps, ReactNode } from 'react'
import './NavigationButton.scss'

interface NavigationButtonProps extends Omit<ComponentProps<'button'>, 'name'> {
  active?: boolean
  name?: ReactNode
  subName?: ReactNode
}

function NavigationButton ({ active, name, subName, disabled, ...props }: NavigationButtonProps) {
  return (
    <button
      className={`NavigationButton ${disabled ? 'NavigationButton__NoActive' : ''} ${active ? 'NavigationButton__Active' : ''}`}
      disabled={disabled}
      {...props}
    >
      {name}
      {subName && (
        <span className={'NavigationButton__SubName'}>
          {subName}
        </span>
      )}
    </button>
  )
}

export default NavigationButton
