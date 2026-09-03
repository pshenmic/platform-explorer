import { SmoothSize } from '@ui/containers'
import LocalisationList from './LocalisationList'
import { cva } from 'class-variance-authority'
import type { Localization } from '../../../types'

import styles from './LocalisationGrid.module.css'

const localisationStyles = cva(styles.root, {
  variants: {
    state: {
      open: [styles.open],
      close: [styles.close]
    }
  }
})

interface LocalisationGridProps {
  isOpen?: boolean
  localisations?: Record<string, Partial<Localization>> | null
}

export const LocalisationGrid = ({ isOpen, localisations = {} }: LocalisationGridProps) => {
  return (
    <SmoothSize className={localisationStyles({ state: isOpen ? 'open' : 'close' })}>
      {Object.keys(localisations || {}).length > 0 && (
        <LocalisationList className={styles.list} localisations={localisations} />
      )}
    </SmoothSize>
  )
}
