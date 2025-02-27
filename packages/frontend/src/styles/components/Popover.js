import { flyoutStyles } from './flyoutStyles'

const Popover = {
  baseStyle: {
    header: {
      ...flyoutStyles.header,
      ...flyoutStyles.title
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
