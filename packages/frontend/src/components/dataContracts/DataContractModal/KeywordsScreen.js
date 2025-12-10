import { Divider, Input, Textarea, FormControl } from '@chakra-ui/react'
import { useId, useState } from 'react'
import { cva } from 'class-variance-authority'

import styles from './KeywordsScreen.module.scss'

const button = cva([styles.btn])

export const KeywordsScreen = ({ onChangeDescription }) => {
  const [form, setForm] = useState({ description: '', keywords: '' })
  const [errors, setErrors] = useState({ keywords: null })
  const id = useId()

  const validateKeywords = (value) => {
    if (!value.trim()) {
      return null
    }

    const keywordsRegex = /^[a-zA-Zа-яА-Я0-9]+(\s*,\s*[a-zA-Zа-яА-Я0-9]+)*$/

    if (!keywordsRegex.test(value)) {
      return 'Please enter words separated by commas only'
    }

    const keywordsArray = value.split(',').map(item => item.trim())
    if (keywordsArray.some(item => item === '')) {
      return 'Please remove empty entries between commas'
    }

    return null
  }

  const handleKeywordsChange = (value) => {
    setForm((prev) => ({ ...prev, keywords: value }))

    const error = validateKeywords(value)
    setErrors((prev) => ({ ...prev, keywords: error }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const keywordsError = validateKeywords(form.keywords)

    if (keywordsError) {
      setErrors((prev) => ({ ...prev, keywords: keywordsError }))
      return
    }

    const keywordsArray = form.keywords
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0)

    const formData = {
      description: form.description,
      keywords: keywordsArray
    }

    onChangeDescription(formData)
  }

  return (
    <div className={styles.root}>
      <div className={styles.divider}>
        <Divider />
      </div>
      <form
        id='data-contract-keywords-form'
        className={styles.form}
        onSubmit={handleSubmit}
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
          <FormControl className={styles.input} isInvalid={!!errors.keywords}>
            <Input
              placeholder='Enter Keywords Separated With Comma...'
              id={`${id}-keywords`}
              value={form.keywords}
              onChange={(e) => handleKeywordsChange(e.target.value)}
              onBlur={() => {
                const error = validateKeywords(form.keywords)
                setErrors((prev) => ({ ...prev, keywords: error }))
              }}
            />
          </FormControl>
        </div>
      </form>
      <div className={styles.controls}>
        <button
          className={button({ className: styles.cancel })}
          type="button"
        >
          Cancel
        </button>
        <button
          className={button({ className: styles.submit })}
          form='data-contract-keywords-form'
          type="submit"
        >
          Submit Changes
        </button>
      </div>
    </div>
  )
}
