import { CardWrapper } from './CardWrapper'
import { SchemaHeader, SchemaField } from './SchemaAtomic'
import { useSchema } from '../SchemaProvider'

import styles from './Schema.module.css'
import createStyles from '../create.module.css'

const DOCS_URL =
  'https://docs.dash.org/projects/platform/en/stable/docs/explanations/platform-protocol-data-contract.html'

const formatBytes = (value: string | undefined | null): number => {
  try {
    return new Blob([value ?? '']).size
  } catch {
    return 0
  }
}

export const Schema = () => {
  const { value } = useSchema()
  const byteSize = formatBytes(value)

  return (
    <CardWrapper title="Contract" className={styles.schema}>
      <SchemaHeader />
      <SchemaField className={styles.code} />
      <div className={createStyles.footer}>
        <span className={createStyles.footerSize}>Size: {byteSize} Bytes</span>
        <a
          className={createStyles.footerLink}
          href={DOCS_URL}
          target="_blank"
          rel="noreferrer"
        >
          Read Data Contract documentation →
        </a>
      </div>
    </CardWrapper>
  )
}
