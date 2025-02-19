// import { badgeColors } from '../colors'

const Popover = {
  baseStyle: props => {
    // const { colorScheme } = props

    return {
      header: {
        // bg: 'green',
        p: 0,
        borderBottom: 0,
        textAlign: 'left'
      },
      body: {
        // bg: 'green',
        p: 0
      },
      content: {
        p: '1rem 1.25rem',
        _focusVisible: {
          boxShadow: 'none'
        }
      }
    }
  }
}

export default Popover
