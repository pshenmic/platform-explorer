import { withFormatting } from './withFormatting'
import { cva } from 'class-variance-authority'

import styles from './FormattedNumber.module.scss'

const BigNumberStyles = cva(styles.root)

const ViewNumber = ({ children, className }) => (
  <span className={BigNumberStyles({ className })}>{children}</span>
)

export const FormattedNumber = withFormatting(ViewNumber)
