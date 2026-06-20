import type { ReactNode } from 'react'
import { cva } from 'class-variance-authority'

import styles from './Label.module.scss'

const labelStyles = cva(styles.label)

interface LabelProps {
  label?: ReactNode
  children?: ReactNode
  className?: string
}

export const Label = ({ label, children, className }: LabelProps) => (
    <label className={labelStyles({ className })}>
        <p className={styles.text}>{label}</p>
        <div className={styles.input}>
            {children}
        </div>
    </label>
)
