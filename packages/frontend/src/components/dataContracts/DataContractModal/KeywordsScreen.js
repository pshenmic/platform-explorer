import { Divider, Input, Textarea, FormControl, FormErrorMessage } from '@chakra-ui/react'
import { useId, useState } from 'react'
import { cva } from 'class-variance-authority'

import styles from './KeywordsScreen.module.scss'

const button = cva([styles.btn])

const DESCRIPTION_MIN = 3
const DESCRIPTION_MAX = 100
const KEYWORD_MIN = 3
const KEYWORD_MAX = 50
const KEYWORDS_MAX_ITEMS = 20

export const KeywordsScreen = ({ onChangeDescription, defaultDescription, defaultKeywords }) => {
  const [form, setForm] = useState({
    description: defaultDescription || '',
    keywords: Array.isArray(defaultKeywords) ? defaultKeywords.join(', ') : ''
  })
  const [errors, setErrors] = useState({ description: null, keywords: null })
  const id = useId()

  const validateDescription = (value) => {
    if (!value.trim()) {
      return null
    }
    if (value.length < DESCRIPTION_MIN) {
      return `Description must be at least ${DESCRIPTION_MIN} characters`
    }
    if (value.length > DESCRIPTION_MAX) {
      return `Description must be at most ${DESCRIPTION_MAX} characters`
    }
    return null
  }

  const validateKeywords = (value) => {
    if (!value.trim()) {
      return null
    }

    const keywordsRegex = /^[a-zA-Z0-9]+(\s*,\s*[a-zA-Z0-9]+)*$/

    if (!keywordsRegex.test(value)) {
      return 'Keywords: Latin letters and digits only, separated by commas'
    }

    const keywordsArray = value.split(',').map(item => item.trim())
    if (keywordsArray.some(item => item === '')) {
      return 'Please remove empty entries between commas'
    }

    if (keywordsArray.length > KEYWORDS_MAX_ITEMS) {
      return `Maximum ${KEYWORDS_MAX_ITEMS} keywords allowed`
    }

    const seen = new Set()
    for (const kw of keywordsArray) {
      const key = kw.toLowerCase()
      if (seen.has(key)) {
        return `Duplicate keyword: '${kw}'`
      }
      seen.add(key)

      if (kw.length < KEYWORD_MIN) return `Each keyword must be at least ${KEYWORD_MIN} characters`
      if (kw.length > KEYWORD_MAX) return `Each keyword must be at most ${KEYWORD_MAX} characters`
    }

    return null
  }

  const handleDescriptionChange = (value) => {
    setForm((prev) => ({ ...prev, description: value }))
    const error = validateDescription(value)
    setErrors((prev) => ({ ...prev, description: error }))
  }

  const handleKeywordsChange = (value) => {
    setForm((prev) => ({ ...prev, keywords: value }))

    const error = validateKeywords(value)
    setErrors((prev) => ({ ...prev, keywords: error }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const descriptionError = validateDescription(form.description)
    const keywordsError = validateKeywords(form.keywords)

    if (descriptionError || keywordsError) {
      setErrors({ description: descriptionError, keywords: keywordsError })
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

  const isSubmitDisabled = !!errors.description || !!errors.keywords

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

          <FormControl className={styles.input} isInvalid={!!errors.description}>
            <Textarea
              placeholder='Enter Description...'
              id={`${id}-description`}
              value={form.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              onBlur={() => {
                const error = validateDescription(form.description)
                setErrors((prev) => ({ ...prev, description: error }))
              }}
              resize='none'
              rows={4}
            />
            <div className={styles.errorSlot}>
              <FormErrorMessage>{errors.description}</FormErrorMessage>
            </div>
          </FormControl>
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
              placeholder='keyword1, keyword2 (Latin only, max 20)'
              id={`${id}-keywords`}
              value={form.keywords}
              onChange={(e) => handleKeywordsChange(e.target.value)}
              onBlur={() => {
                const error = validateKeywords(form.keywords)
                setErrors((prev) => ({ ...prev, keywords: error }))
              }}
            />
            <div className={styles.errorSlot}>
              <FormErrorMessage>{errors.keywords}</FormErrorMessage>
            </div>
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
          disabled={isSubmitDisabled}
        >
          Submit Changes
        </button>
      </div>
    </div>
  )
}
