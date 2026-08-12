'use client'

import type { ComponentPropsWithoutRef } from 'react'
import { ChevronIcon } from '../icons'
import './ArrowButton.css'

function ArrowButton ({ children, className, ...props }: ComponentPropsWithoutRef<'button'>) {
  return (
    <button className={`ArrowButton ${className || ''}`} {...props}>
      <ChevronIcon/>
    </button>
  )
}

export default ArrowButton
