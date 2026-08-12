'use client'

import ReactSelect from 'react-select'
import type { MenuPlacement, SingleValue } from 'react-select'
import type { WithClassName } from '../../../types/common'
import './Select.scss'

export interface SelectOption {
  value: string | number
  label: string
}

type SelectValue = SelectOption | string | number | null | undefined

interface SelectProps extends WithClassName {
  value?: SelectValue
  onChange?: (option: SingleValue<SelectOption>) => void
  options?: SelectValue[]
  menuPlacement?: MenuPlacement
  menuPortalTarget?: HTMLElement | null
  usePortal?: boolean
}

function normalize (option: SelectValue): SelectOption {
  if (option != null && typeof option === 'object') {
    return {
      value: option.value ?? '',
      label: option.label ?? String(option.value ?? '')
    }
  }
  return { value: (option as string | number) ?? '', label: String(option ?? '') }
}

export default function Select ({
  value,
  onChange,
  options,
  menuPlacement = 'auto',
  menuPortalTarget,
  usePortal = false,
  className
}: SelectProps) {
  const portalTarget = usePortal || menuPortalTarget
    ? menuPortalTarget ?? (typeof window !== 'undefined' ? document.body : null)
    : null

  return (
    <ReactSelect<SelectOption>
      className={`Select ${className || ''}`}
      isSearchable={false}
      classNamePrefix={'react-select'}
      menuPlacement={menuPlacement}
      menuPortalTarget={portalTarget}
      onChange={onChange}
      {...(value
        ? { value: normalize(value) }
        : {})}
      options={options?.map(normalize)}
    />
  )
}
