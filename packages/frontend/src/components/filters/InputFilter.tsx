import type { ReactNode, ChangeEvent } from 'react'
import { SubmitButton } from '../ui/forms'
import FilterActions from './FilterActions'
import './InputFilter.css'

interface InputFilterProps {
  value?: string | number | null
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  showSubmitButton?: boolean
  onSubmit?: () => void
  title?: ReactNode
}

export const InputFilter = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  showSubmitButton = false,
  onSubmit,
  title
}: InputFilterProps) => (
  <div className={'InputFilter'}>
    {title && <div className={'InputFilter__Title'}>{title}</div>}

    <input
      className={'InputFilter__Input'}
      type={type}
      value={value || ''}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder={placeholder}
    />

    {showSubmitButton && (
      <FilterActions>
        <SubmitButton onSubmit={onSubmit} />
      </FilterActions>
    )}
  </div>
)
