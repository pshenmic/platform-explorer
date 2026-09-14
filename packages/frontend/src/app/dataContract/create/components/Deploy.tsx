import { CardWrapper } from './CardWrapper'
import { MethodSelect, DeployButton, DeployStatus, PrivateKeyForm } from './SchemaAtomic'
import styles from '../create.module.css'

export const Deploy = () => (
  <CardWrapper title="Deploy">
    <div className={styles.deployStack}>
      <MethodSelect />
      <PrivateKeyForm />
      <div className={styles.statusSlot}>
        <DeployStatus />
      </div>
      <DeployButton />
    </div>
  </CardWrapper>
)
