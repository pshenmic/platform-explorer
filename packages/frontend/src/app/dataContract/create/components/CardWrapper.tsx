import type { ReactNode } from 'react'
import { cva } from 'class-variance-authority'

import styles from './CardWrapper.module.css'

const cardStyles = cva(styles.root)

interface CardWrapperProps {
  title: ReactNode
  children?: ReactNode
  className?: string
}

export const CardWrapper = ({ title, children, className }: CardWrapperProps) => (
  <div className={[cardStyles(), className].filter(Boolean).join(' ')}>
    <h2 className={styles.title}>{title}</h2>
    <div className={styles.body}>{children}</div>
  </div>
)
