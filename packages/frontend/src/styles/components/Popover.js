// import { badgeColors } from '../colors'

//&__Content {
//  background-color: #3E4A4F !important;
//  border-radius: 10px !important;
//  border: 4px solid !important;
//  border-top-color: #72787B4D !important;
//  border-bottom-color: #181F23 !important;
//  border-left: var(--chakra-borders-none) !important;
//  border-right: var(--chakra-borders-none) !important;
//  padding: 1rem 1.25rem !important;
//}
//
//&__Body, &__Header {
//  padding: 0 !important;
//}

const Popover = {
  baseStyle: props => {
    // const { colorScheme } = props

    return {
      header: {
        // bg: 'green',
        p: 0,
        borderBottom: 0,
        textAlign: 'left',
        fontFamily: 'heading',
        fontWeight: 700,
        fontSize: '0.75rem'
      },
      body: {
        fontFamily: 'mono',
        // bg: 'green',
        p: 0,
        // fontSize: '0.688rem'
      },
      content: {
        gap: '0.5rem',
        p: '1rem 1.25rem',
        bg: '#3E4A4F',
        borderRadius: '10px',
        border: '4px solid',
        borderTopColor: '#72787B4D',
        borderBottomColor: '#181F23',
        borderLeft: 'none',
        borderRight: 'none',
        _focusVisible: {
          boxShadow: 'none'
        }
      }
    }
  }
}

export default Popover
