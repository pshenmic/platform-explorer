import { FORM_MODE_ENUM } from './constants'

import styles from './InitialScreen.module.scss'

export const InitialScreen = ({ setMode }) => (
  <div className={styles.root}>
    <span className={styles.description}>
      Select what information you would like to edit. You can change Data
      Contract Name or Description with Keywords. Notice you can only change the
      name once every 15 minutes
    </span>

  <div className={styles.controls}>
    <button className={styles.card} onClick={() => setMode(FORM_MODE_ENUM.NAME_EDIT)}>edit name</button>
    <button className={styles.card} onClick={() => setMode(FORM_MODE_ENUM.KEYWORDS_EDIT)}>
      edit Keywords
    </button>
  </div>
  </div>
)
