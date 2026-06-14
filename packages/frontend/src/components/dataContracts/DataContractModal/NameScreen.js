import { Divider, Input, FormControl } from '@chakra-ui/react'
import { useState } from 'react'
import { cva } from 'class-variance-authority'

import { FORM_MODE_ENUM } from './constants'
import styles from './NameScreen.module.scss'

const button = cva([styles.btn])

const NAME_MIN = 3
const NAME_MAX = 32

export const NameScreen = ({ onChangeName, setMode, defaultName }) => {
  const [form, setForm] = useState({ name: defaultName || '' })
  const [error, setError] = useState(null)

  const validateName = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return 'Name is required'
    if (trimmed.length < NAME_MIN) return `Name must be at least ${NAME_MIN} characters`
    if (trimmed.length > NAME_MAX) return `Name must be at most ${NAME_MAX} characters`
    return null
  }

  const handleNameChange = (value) => {
    setForm({ name: value })
    setError(validateName(value))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const err = validateName(form.name)
    if (err) {
      setError(err)
      return
    }
    onChangeName({ name: form.name.trim() })
  }

  const isSubmitDisabled = !!error || !form.name.trim()

  return (
    <div className={styles.root}>
      <div className={styles.divider}>
        <Divider />
      </div>
      <form
        className={styles.form}
        id='data-contract-name-form'
        onSubmit={handleSubmit}
      >
        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor='data-contract-name'
          >
            Data Contract Name:
          </label>
          <FormControl className={styles.input} isInvalid={!!error}>
            <Input
              placeholder='Enter Name...'
              id='data-contract-name'
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => setError(validateName(form.name))}
            />
          </FormControl>

          <div className={styles.errorSlot}>
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        </div>
      </form>
      <div className={styles.controls}>
        <button
          className={button({ className: styles.cancel })}
          type="button"
          onClick={() => setMode(FORM_MODE_ENUM.INITIAL)}
        >
          Cancel
        </button>
        <button
          type='submit'
          className={button({ className: styles.submit })}
          form='data-contract-name-form'
          disabled={isSubmitDisabled}
        >
          Submit Changes
        </button>
      </div>
    </div>
  )
}
