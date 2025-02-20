import { flyoutStyles } from './flyoutStyles'

const Popover = {
  baseStyle: {
    header: {
      p: 0,
      borderBottom: 0,
      textAlign: 'left',
      fontFamily: 'heading',
      fontWeight: 700,
      fontSize: '0.75rem'
    },
    body: {
      fontFamily: 'mono',
      p: 0
    },
    content: {
      ...flyoutStyles.content,
      fontSize: '0.688rem'
    }
  }
}

export default Popover
