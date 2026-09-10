import type { ReactNode } from 'react'
import { withFormatting } from './withFormatting'
import { cva } from 'class-variance-authority'

import styles from './FormattedNumber.module.css'

const BigNumberStyles = cva(styles.root)

interface ViewNumberProps {
  children?: ReactNode
  className?: string
}

const ViewNumber = ({ children, className }: ViewNumberProps) => (
  <span className={BigNumberStyles({ className })}>{children}</span>
)

export const FormattedNumber = withFormatting(ViewNumber)
