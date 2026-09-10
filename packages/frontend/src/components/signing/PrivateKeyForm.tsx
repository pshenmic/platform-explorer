import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import styles from './signing.module.css'

const noAutofillProps = {
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: false,
  'data-1p-ignore': 'true',
  'data-lpignore': 'true',
  'data-form-type': 'other'
} as const

interface PrivateKeyFormProps {
  wif: string
  setWif: Dispatch<SetStateAction<string>> | ((value: string) => void)
  identityId: string
  setIdentityId: Dispatch<SetStateAction<string>> | ((value: string) => void)
  isInactive?: boolean
  identityIdPlaceholder?: string
}

export const PrivateKeyForm = ({
  wif,
  setWif,
  identityId,
  setIdentityId,
  isInactive,
  identityIdPlaceholder = 'Identity ID (optional)'
}: PrivateKeyFormProps) => {
  const [showWif, setShowWif] = useState(false)

  return (
    <div className={styles.row}>
      <div className={styles.field}>
        <input
          className={`${styles.input}${showWif ? '' : ` ${styles.inputMasked}`}`}
          type="text"
          name="wif"
          placeholder="WIF, hex, or base64"
          value={wif}
          disabled={isInactive}
          onChange={e => setWif(e.target.value)}
          {...noAutofillProps}
        />
        <button
          type="button"
          className={styles.toggle}
          tabIndex={-1}
          aria-label={showWif ? 'Hide private key' : 'Show private key'}
          onClick={() => setShowWif(v => !v)}
        >
          {showWif ? 'Hide' : 'Show'}
        </button>
      </div>
      <div className={styles.field}>
        <input
          className={styles.input}
          placeholder={identityIdPlaceholder}
          value={identityId}
          disabled={isInactive}
          onChange={e => setIdentityId(e.target.value)}
          {...noAutofillProps}
        />
      </div>
    </div>
  )
}
