import { FormControls } from './FormControls'
import styles from '../../create.module.css'

export const SchemaHeader = () => (
  <div className={styles.header}>
    <h2 className={styles.headerTitle}>Contract Scheme</h2>
    <FormControls />
  </div>
)
