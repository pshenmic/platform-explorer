import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: 'dark'
  },
  initialColorMode: 'dark',
  useSystemColorMode: false,
  colors: {
    brand: {
      normal: '#008DE4',
      deep: '#0E75B5',
      shaded: '#165278',
      light: '#5ca5d1'
    },
    white: {
      50: '#FFFFFF'
    },
    gray: {
      50: '#f0f1f2',
      100: '#e0e3e5',
      200: '#c6cacd',
      250: '#93aab2',
      300: '#acb1b4',
      400: '#94999c',
      500: '#7b7f83',
      525: '#849099',
      550: '#52585d6b',
      600: '#62676a',
      700: '#494e51',
      800: '#313639',
      900: '#181d20',
      1000: '#93aab2',
      1100: '#2e393d'
    }
  },
  styles: {
    global: {
      '*': {
        borderColor: 'gray.800'
      },
      'html, body': {
        background: '#181d20',
        color: 'white',
        scrollBehavior: 'smooth'
      },
      h1: {
        fontSize: '4xl',
        my: '6'
      },
      h2: {
        fontSize: '3xl',
        my: '4'
      },
      h3: {
        fontSize: 'xl',
        my: '2'
      },
      h4: {
        fontSize: 'lg',
        my: '2'
      },
      h5: {
        fontSize: 'md',
        my: '2'
      },
      h6: {
        fontSize: 'sm',
        my: '2'
      },
      p: {
        my: 2
      },
      ul: {
        ml: 5,
        my: 5,

        li: {
          my: 1
        }
      },
      pre: {
        p: 4,
        my: 2,
        borderRadius: 'lg',
        background: 'gray.800',
        whiteSpace: 'break-spaces',

        code: {
          background: 'transparent',
          p: 0
        }
      },
      code: {
        px: 2,
        py: 1,
        mx: 1,
        borderRadius: 'lg',
        fontFamily: 'mono',
        background: 'gray.800',
        display: 'inline-block'
      },
      Container: {
        a: {
          color: 'brand.normal',

          _hover: {
            color: 'brand.deep'
          }
        }
      },
      Table: {
        a: {
          borderBottom: '1px solid',

          _hover: {
            borderBottom: 'none',
            color: 'gray.200'
          }
        }
      }
    }
  },
  components: {
    Container: {
      baseStyle: {
        p: 3
      }
    },
    Modal: {
      baseStyle: {
        dialog: {
          background: 'gray.800'
        }
      }
    },
    Code: {
      baseStyle: {
        whiteSpace: 'break-spaces',
        p: 4,
        borderRadius: 'lg'
      }
    }
  }
})

export default theme
