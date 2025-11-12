import { FORM_MODE_ENUM } from './constants'

export const InitialScreen = ({ setMode }) => (
        <>
          Select what information you would like to edit. You can change Data
          Contract Name or Description with Keywords. Notice you can only change
          the name once every 15 minutes

          <button onClick={() => setMode(FORM_MODE_ENUM.NAME_EDIT)}>edit name</button>
          <button onClick={() => setMode(FORM_MODE_ENUM.KEYWORDS_EDIT)} >edit Keywords</button>

        </>
)
