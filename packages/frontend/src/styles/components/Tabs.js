const Tabs = {
  baseStyle: {
    tab: {
      background: 'blue',
      position: 'relative',
      zIndex: '123',
      marginBottom: '0 !important',
      borderRadius: '4px 4px 0 0',
      p: {
        base: '6px',
        sm: '8px',
        xl: '10px'
      },

      _selected: {
        color: 'brand.normal',
        marginBottom: 0,
        borderBottom: 0,

        _after: {
          content: '""',
          display: 'block',
          width: {
            base: 'calc(100% - 12px)',
            sm: 'calc(100% - 16px)',
            xl: 'calc(100% - 20px)'
          },
          height: '1px',
          backgroundColor: 'brand.normal',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)'
        }
      },
      _hover: {
        backgroundColor: 'whiteAlpha.100'
      },
      _active: {
        backgroundColor: 'whiteAlpha.50'
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
