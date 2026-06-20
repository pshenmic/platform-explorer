'use client'

import type { ComponentProps } from 'react'
import { ChevronIcon } from '../icons'
import './ArrowButton.scss'

function ArrowButton ({ children, className, ...props }: ComponentProps<'button'>) {
  return (
    <button className={`ArrowButton ${className || ''}`} {...props}>
      <ChevronIcon/>
    </button>
  )
}

export default ArrowButton
