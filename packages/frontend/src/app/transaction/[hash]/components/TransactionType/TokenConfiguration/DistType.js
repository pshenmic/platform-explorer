import { InfoLine } from '@components/data'
import { ValueContainer } from '@ui/containers'

import styles from './DistType.module.scss'
import { InfoIcon } from '@components/ui/icons'

const distDataByType = ({ type, functionValue }) => {
  if (type === 'FixedAmount') {
    return {
      title: 'Fixed Amount',
      amount: functionValue.amount
    }
  }

  if (type === 'Random') {
    return {
      title: 'Random',
      min: functionValue.min,
      max: functionValue.max
    }
  }

  if (type === 'StepDecreasingAmount') {
    return {
      title: 'Step Decreasing Amount',
      'Step count': functionValue.stepCount,
      'Decrease per interval': '',
      'Token amount': ''
    }
  }
}

export const DistType = ({ subtitle }) => (
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
                <strong className={styles.title}>Fixed Amount</strong>
                <InfoIcon
                  color='#58F4BC'
                  width='1rem'
                  height='1rem'
                />
              </div>
              <p className={styles.field}>
                Amount: <b>505 120 401</b>
              </p>
            </ValueContainer>
          </ValueContainer>
        }
      />
    }
  />
)
