import { cva } from 'class-variance-authority'

import styles from './Label.module.scss'

const labelStyles = cva(styles.label)

export const Label = ({ label, children, className }) => (
    <label className={labelStyles({ className })}>
        <p className={styles.text}>{label}</p>
        <div className={styles.input}>
            {children}
        </div>
    </label>
)
