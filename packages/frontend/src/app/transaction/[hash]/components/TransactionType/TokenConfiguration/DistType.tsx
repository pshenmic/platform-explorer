import { InfoLine } from '@components/data'
import { ValueContainer } from '@ui/containers'

import { InfoIcon } from '@components/ui/icons'
import { distDataByType, type DistField } from './serialaze'

import styles from './DistType.module.css'

interface DistTypeDetails {
  functionName?: string | null
  functionValue?: Record<string, unknown> | null
}

interface DistTypeProps {
  details: DistTypeDetails
}

export const DistType = ({ details }: DistTypeProps) => {
  const result = distDataByType({
    type: details.functionName,
    functionValue: details.functionValue
  })

  if (!result) return null

  const { title, ...fields } = result
  const keys = Object.keys(fields)

  return (
    <InfoLine
      title={<b>Token distribution rules</b>}
      className={styles.root}
      value={
        <InfoLine
          className={styles.subcategory}
          postfix=''
          title='Perpetual distribution'
          value={
            <ValueContainer
              className={styles.container}
              size={'sm'}
              colorScheme={'gray'}
            >
              <span className={styles.title}>Distribution type</span>
              <ValueContainer
                className={styles.card}
                size={'sm'}
                colorScheme={'gray'}
              >
                <div className={styles.header}>
                  <strong className={styles.title}>{title}</strong>
                  <InfoIcon
                    color='#58F4BC'
                    width='1rem'
                    height='1rem'
                  />
                </div>
                <div className={styles.list}>
                  {keys.map((name) => {
                    const field = fields[name] as DistField
                    return field?.value
                      ? (
                      <p
                        key={name}
                        className={styles.field}
                      >
                        {field.title}: <b>{String(field.value)}</b>
                      </p>
                        )
                      : null
                  })}
                </div>
              </ValueContainer>
            </ValueContainer>
          }
        />
      }
    />
  )
}
