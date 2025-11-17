import { InfoLine } from '@components/data'
import { ValueContainer } from '@ui/containers'

import { InfoIcon } from '@components/ui/icons'
import { distDataByType } from './serialaze'

import styles from './DistType.module.scss'

export const DistType = ({ details }) => {
  const { title, ...fields } = distDataByType({
    type: details.functionName,
    functionValue: details.functionValue
  })
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
                  {keys.map((name) =>
                    fields[name].value
                      ? (
                      <p
                        key={name}
                        className={styles.field}
                      >
                        {fields[name].title}: <b>{fields[name].value}</b>
                      </p>
                        )
                      : null
                  )}
                </div>
              </ValueContainer>
            </ValueContainer>
          }
        />
      }
    />
  )
}
