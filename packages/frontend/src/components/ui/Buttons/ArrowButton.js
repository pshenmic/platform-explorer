'use client'

import { ChevronIcon } from '../icons'
import './ArrowButton.scss'

function ArrowButton ({ children, className, ...props }) {
  return (
    <button className={`ArrowButton ${className || ''}`} {...props}>
      <ChevronIcon/>
    </button>
  )
}

export default ArrowButton
