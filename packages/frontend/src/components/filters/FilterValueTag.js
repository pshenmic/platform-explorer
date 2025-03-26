import React from 'react'
import './FilterValueTag.scss'

export const FilterValueTag = ({ value, type, rawValue, options, mobileRenderer }) => {
  console.log('FilterValueTag props', { value, type, rawValue, options, mobileRenderer })

  if (mobileRenderer) {
    return mobileRenderer(rawValue)
  }

  switch (type) {
    case 'multiselect':
      return (
        <div>
           {rawValue.map((selectedValue) => {
             const option = options?.find((option) => option?.value === selectedValue)
             return option?.label || option?.title || option?.value
           })}
        </div>
      )

    case 'range':
      if (typeof rawValue === 'object') {
        const { min, max } = rawValue

        if (min && max) {
          return <div>{`From ${min} to ${max}`}</div>
        }
        if (min) {
          return <div>{`Min ${min}`}</div>
        }
        if (max) {
          return <div>{`Max ${max}`}</div>
        }
      }

      return <div>{value}</div>

    case 'input':
      return <div>{value}</div>

    default:
      return <div>{value}</div>
  }
}
