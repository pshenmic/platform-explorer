'use client'

import ReactSelect from 'react-select'
import './Select.scss'

export default function Select ({
  value,
  onChange,
  options,
  menuPlacement = 'auto',
  menuPortalTarget,
  usePortal = false,
  className
}) {
  const portalTarget = usePortal || menuPortalTarget
    ? menuPortalTarget ?? (typeof window !== 'undefined' ? document.body : null)
    : null

  return (
    <ReactSelect
      className={`Select ${className || ''}`}
      isSearchable={false}
      classNamePrefix={'react-select'}
      menuPlacement={menuPlacement}
      menuPortalTarget={portalTarget}
      onChange={onChange}
      {...(value ? { value: { value: value?.value || value, label: value?.label || value } } : {})}
      options={options?.map((option) => ({
        value: option?.value || option,
        label: option?.label || option
      }))}
    />
  )
}
