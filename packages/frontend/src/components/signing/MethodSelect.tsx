import { useId } from 'react'
import { SignerMethod } from 'src/hooks/useSigner'
import styles from './signing.module.css'

interface MethodSelectProps {
  value?: string
  onChange?: (nextValue: string) => void
  isDisabled?: boolean
}

export const MethodSelect = ({ value, onChange, isDisabled }: MethodSelectProps) => {
  const name = useId()
  return (
    <div className={styles.radios} role="radiogroup">
      <label className={styles.radio}>
        <input
          type="radio"
          name={name}
          value={SignerMethod.EXTENSION}
          checked={value === SignerMethod.EXTENSION}
          disabled={isDisabled}
          onChange={() => onChange?.(SignerMethod.EXTENSION)}
        />
        Extension
      </label>
      <label className={styles.radio}>
        <input
          type="radio"
          name={name}
          value={SignerMethod.PRIVATE_KEY}
          checked={value === SignerMethod.PRIVATE_KEY}
          disabled={isDisabled}
          onChange={() => onChange?.(SignerMethod.PRIVATE_KEY)}
        />
        Private Key
      </label>
    </div>
  )
}
