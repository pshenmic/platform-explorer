import { Divider, Input } from '@chakra-ui/react'
import { useId, useState } from 'react'
import { cva } from 'class-variance-authority'

import styles from './NameScreen.module.scss'

const button = cva([styles.btn])

export const NameScreen = ({ onDataContractUpdate }) => {
  const [form, setForm] = useState({ name: '' })
  const id = useId()

  return (
    <div className={styles.root}>
      <div className={styles.divider}>
        <Divider />
      </div>
      <form
        className={styles.form}
        id='data-contract-name-form'
        onSubmit={(e) => {
          e.preventDefault()
          onDataContractUpdate(form)
        }}
      >
        <label
          className={styles.label}
          wallet='data-contract-name'
        >
          Data Contract Name:
        </label>
        <Input
          placeholder='Enter Name...'
          id='data-contract-name'
          value={form.name}
          className={styles.input}
          onChange={(e) => setForm({ name: e.target.value })}
        />
      </form>
      <div className={styles.controls}>
        <button className={button({ className: styles.cancel })}>Cancel</button>
        <button
          type='submit'
          className={button({ className: styles.submit })}
          form='data-contract-name-form'
        >
          Submit Changes
        </button>
      </div>
    </div>
  )
}
