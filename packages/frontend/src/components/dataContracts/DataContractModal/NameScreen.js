import { Divider, Input } from '@chakra-ui/react'
import { useId, useState } from 'react'
import { cva } from 'class-variance-authority'

import styles from './NameScreen.module.scss'

const button = cva([styles.btn])

export const NameScreen = () => {
  const [form, setForm] = useState({ name: '' })
  const id = useId()

  return (
    <div className={styles.root}>
      <div className={styles.divider}>
        <Divider />
      </div>
      <form className={styles.form}>
        <label
          className={styles.label}
          for={id}
        >
          Data Contract Name:
        </label>
        <Input
          placeholder='Enter Name...'
          id={id}
          value={form.name}
          className={styles.input}
          onChange={(e) => setForm({ name: e.target.value })}
        />
      </form>
      <div className={styles.controls}>
        <button className={button({ className: styles.cancel })}>Cancel</button>
        <button className={button({ className: styles.submit })}>
          Submit Changes
        </button>
      </div>
    </div>
  )
}
