import { Divider, Input, Textarea } from '@chakra-ui/react'
import { useId, useState } from 'react'
import { cva } from 'class-variance-authority'

import styles from './KeywordsScreen.module.scss'

const button = cva([styles.btn])

export const KeywordsScreen = ({ onChangeDescription }) => {
  const [form, setForm] = useState({ description: '', keywords: '' })
  const id = useId()

  return (
    <div className={styles.root}>
      <div className={styles.divider}>
        <Divider />
      </div>
      <form
        id='data-contract-keywords-form'
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault()
          onChangeDescription(form)
        }}
      >
        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor={`${id}-description`}
          >
            Description:
          </label>

          <Textarea
            className={styles.input}
            placeholder='Enter Description...'
            id={`${id}-description`}
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            resize='none'
            rows={4}
          />
        </div>
        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor={`${id}-keywords`}
          >
            Keywords:
          </label>
          <Input
            placeholder='Enter Keywords Separated With Comma...'
            id={`${id}-keywords`}
            value={form.keywords}
            className={styles.input}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, keywords: e.target.value }))
            }
          />
        </div>
      </form>
      <div className={styles.controls}>
        <button className={button({ className: styles.cancel })}>Cancel</button>
        <button
          className={button({ className: styles.submit })}
          form='data-contract-keywords-form'
        >
          Submit Changes
        </button>
      </div>
    </div>
  )
}
