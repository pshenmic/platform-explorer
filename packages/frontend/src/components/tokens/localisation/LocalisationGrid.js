import { SmoothSize } from '@ui/containers'
import LocalisationList from './LocalisationList'
import { cva } from 'class-variance-authority'

import styles from './LocalisationGrid.module.scss'

const localisationStyles = cva(styles.root, {
  variants: {
    state: {
      open: [styles.open],
      close: [styles.close]
    }
  }
})

export const LocalisationGrid = ({ isOpen, localisations = {} }) => {
  return (
    <SmoothSize
      className={localisationStyles({ state: isOpen ? 'open' : 'close' })}
    >
      {Object.keys(localisations).length > 0 && (
        <LocalisationList
          className={styles.list}
          localisations={localisations}
        />
      )}
    </SmoothSize>
  )
}
