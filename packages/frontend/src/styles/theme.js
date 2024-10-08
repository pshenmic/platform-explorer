import { extendTheme } from '@chakra-ui/react'
import {
  Montserrat,
  Open_Sans as OpenSans,
  Roboto_Mono as RobotoMono
} from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'] })
const openSans = OpenSans({ subsets: ['latin'] })
const robotoMono = RobotoMono({ subsets: ['latin'] })

export const theme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: 'dark'
  },
  fonts: {
    heading: montserrat.style.fontFamily,
    body: openSans.style.fontFamily,
    mono: robotoMono.style.fontFamily
  },
  space: {
    px: '1px',
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.375rem',
    10: '2.5rem'
  },
  blockOffset: [3, 4, 5, 5, 10],
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
    red: {
      default: '#F45858'
    },
    yellow: {
      default: '#FFD205'
    },
    green: {
      default: '#81F458'
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
      650: '#232C30',
      675: '#21272C',
      700: '#494e51',
      750: '#39454C',
      800: '#2e393d',
      900: '#181d20'
    }
  },
  radii: {
    block: '30px'
  },
  styles: {
    global: {
      '*': {
        borderColor: 'rgba(255, 255, 255, 0.07)'
      },
      'html, body': {
        color: 'white',
        scrollBehavior: 'smooth',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
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
    },
    Button: {
      baseStyle: {
        fontFamily: 'heading',
        textTransform: 'uppercase',
        borderRadius: '10px',
        letterSpacing: '0.4px',
        fontWeight: '700'
      },
      sizes: {
        sm: {
          fontSize: '12px'
        },
        md: {
          fontSize: '12px'
        }
      }
    },
    Badge: {
      baseStyle: props => {
        const { colorScheme } = props
        const backgroundColors = {
          red: '#4E3234',
          green: '#2B4629',
          gray: 'gray.600',
          blue: 'rgba(0, 141, 228, 0.2)',
          yellow: 'rgba(244, 228, 88, 0.2)',
          orange: 'rgba(244, 154, 88, 0.2)',
          emerald: 'rgba(88, 244, 188, 0.2)'
        }
        const textColor = {
          red: '#F45858',
          green: '#81F458',
          gray: 'gray.50',
          blue: 'rgb(0, 141, 228)',
          yellow: '#F4E458',
          orange: 'rgb(244, 154, 88)',
          emerald: 'rgb(88, 244, 188)'
        }

        return {
          borderWidth: '0px',
          padding: '0 12px',
          borderRadius: '999px',
          fontFamily: 'mono',
          fontSize: '0.625rem',
          textTransform: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          bg: backgroundColors[colorScheme] || 'gray.500',
          color: textColor[colorScheme] || 'white'
        }
      }
    },
    Progress: {
      baseStyle: props => {
        const { colorScheme } = props
        const trackColor = {
          red: '#4E3234',
          green: '#2B4629',
          gray: 'gray.600',
          blue: 'rgba(0, 141, 228, 0.3)',
          yellow: 'rgba(244, 228, 88, 0.2)',
          orange: 'rgba(244, 154, 88, 0.2)',
          emerald: 'rgba(88, 244, 188, 0.2)'
        }
        const filledColor = {
          red: '#F45858',
          green: '#81F458',
          gray: 'gray.200',
          blue: 'rgba(0, 141, 228, 1)',
          yellow: '#F4E458',
          orange: 'rgb(244, 154, 88)',
          emerald: 'rgb(88, 244, 188)'
        }

        return {
          track: {
            bg: trackColor[colorScheme] || 'rgba(0, 141, 228, 0.3)'
          },
          filledTrack: {
            bg: filledColor[colorScheme] || 'rgba(0, 141, 228, 1)'
          }
        }
      }
    }
  }
})

export default theme
