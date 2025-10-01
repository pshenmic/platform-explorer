import { withFormatting } from './withFormatting'
import clsx from 'clsx'
import './FormattedNumber.scss'

const ViewNumber = ({ children, className }) => <span className={clsx('BigNumber', className)}>{children}</span>

export const FormattedNumber = withFormatting(ViewNumber)
