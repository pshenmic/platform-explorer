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
  },
  variants: {
    menu: {
      content: {
        bg: 'gray.650',
        borderColor: 'transparent',
        border: 'none',
        boxShadow: '0px 1.25rem 2rem rgba(0, 0, 0, 0.25)',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        _focus: {
          boxShadow: '0px 1.25rem 2rem rgba(0, 0, 0, 0.25)'
        }
      },
      body: {
        p: 0,
        borderRadius: '0',
        overflow: 'hidden'
      },
      arrow: {
        bg: 'gray.800',
        borderColor: 'whiteAlpha.100'
      }
    }
  }
}

export default Popover
