const tabPaddingSize = {
  base: 6,
  sm: 8,
  xl: 10
}

const Tabs = {
  baseStyle: {
    tab: {
      background: 'blue',
      position: 'relative',
      zIndex: '123',
      marginBottom: '0 !important',
      borderRadius: '4px 4px 0 0',
      borderBottom: 0,
      border: '0px transparent',
      mb: '0px',
      p: {
        base: `${tabPaddingSize.base}px`,
        sm: `${tabPaddingSize.sm}px`,
        xl: `${tabPaddingSize.xl}px`
      },

      _after: {
        content: '""',
        display: 'block',
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `calc(100% - ${tabPaddingSize.base * 6}px)`,
        height: '1px',
        opacity: 0,
        visibility: 'hidden',
        transition: 'all .2s'
      },

      _selected: {
        color: 'brand.normal !important',
        marginBottom: 0,
        borderBottom: 0,
        borderColor: 'transparent',

        _after: {
          backgroundColor: 'brand.normal !important',
          opacity: 1,
          visibility: 'visible',
          width: `calc(100% - ${tabPaddingSize.base * 2}px)`
        }
      },
      _focusVisible: {
        boxShadow: 'none'
      },
      _hover: {
        color: 'white',

        _after: {
          content: '""',
          backgroundColor: 'whiteAlpha.400',
          opacity: 1,
          visibility: 'visible',
          width: `calc(100% - ${tabPaddingSize.base * 2}px)`
        }
      },
      _active: {
        backgroundColor: 'transparent'
      }
    },
    tablist: {
      position: 'relative',
      borderBottom: 'none !important',
      border: 'none !important',

      _after: {
        content: '""',
        display: 'block',
        width: '100%',
        height: '1px',
        backgroundColor: 'gray.800',
        position: 'absolute',
        bottom: '0',
        left: 0
      }
    }
  }
}

export default Tabs
