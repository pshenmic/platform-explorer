import { Divider, Input } from '@chakra-ui/react'
import { useId, useState } from 'react'

import styles from './NameScreen.module.scss'

export const NameScreen = () => {
  const [form, setForm] = useState({ name: '' })
  const id = useId()

  return (
    <div className={styles.root}>
      <div className={styles.divider}>
        <Divider />
      </div>
      <form className={styles.form}>
        <label className={styles.label} for={id}>Data Contract Name:</label>
        <Input
          id={id}
          value={form.name}
          className={styles.input}
          onChange={(e) => setForm({ name: e.target.value })}
        />
      </form>
    </div>
  )
}
