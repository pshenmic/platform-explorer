'use client'

import { useEffect, useState } from 'react'

export default function Checkbox ({ initialChecked, forceChecked, onChange, className }) {
  const [checked, setChecked] = useState(initialChecked ?? forceChecked ?? false)

  useEffect(() => {
    if (typeof onChange === 'function') onChange(checked)
  }, [checked, onChange])

  useEffect(() => {
    setChecked(forceChecked)
  }, [forceChecked])

  return (
    <div
      className={`Checkbox ${className || ''}`}
      onClick={() => setChecked(state => !state)}
    >
      <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M0 2C0 0.89543 0.895431 0 2 0H16C17.1046 0 18 0.895431 18 2V16C18 17.1046 17.1046 18 16 18H2C0.89543 18 0 17.1046 0 16V2Z'
          fill={checked ? '#008DE4' : '#494E51'}
        />
        {checked &&
          <path
            d='M14.0303 5.46967C14.3232 5.76256 14.3232 6.23744 14.0303 6.53033L8 12.5607L4.46967 9.03033C4.17678 8.73744 4.17678 8.26256 4.46967 7.96967C4.76256 7.67678 5.23744 7.67678 5.53033 7.96967L8 10.4393L12.9697 5.46967C13.2626 5.17678 13.7374 5.17678 14.0303 5.46967Z'
            fillRule='evenodd'
            clipRule='evenodd'
            fill='white'
          />
        }
      </svg>
    </div>
  )
}
