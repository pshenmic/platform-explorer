import { CloseIcon } from '@components/ui/icons'
import { useSchema } from '../../SchemaProvider'
import styles from '../../create.module.css'

export const FormControls = () => {
  const { value, error: schemaError, handleChange, handleReset } = useSchema()

  const handleFormat = () => {
    try {
      handleChange(JSON.stringify(JSON.parse(value), null, 2))
    } catch {
      // JSON invalid — error shown separately, nothing to format
    }
  }

  return (
    <div className={styles.controls}>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnBlue}`}
        onClick={handleFormat}
        disabled={schemaError != null}
      >
        Format
      </button>
      <button type="button" className={`${styles.btn} ${styles.btnRed}`} onClick={handleReset}>
        <CloseIcon />
        Reset
      </button>
    </div>
  )
}
