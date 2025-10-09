import { InfoLine } from '@components/data'
import { ValueContainer } from '@ui/containers'

import styles from './DistType.module.scss'

export const DistType = ({ title, subtitle }) => (
  <InfoLine
    postfix=''
    title={title}
    className={styles.root}
    value={
      <InfoLine
        postfix=''
        title={subtitle}
        value={
          <ValueContainer
            className={styles.container}
            size={'sm'}
            colorScheme={'gray'}
          >
            <span className={styles.title}>title</span>
            <ValueContainer
              className={styles.card}
              size={'sm'}
              colorScheme={'gray'}
            >
              {123}
            </ValueContainer>
          </ValueContainer>
        }
      />
    }
  />
)
