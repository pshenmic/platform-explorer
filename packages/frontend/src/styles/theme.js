import { extendTheme } from '@chakra-ui/react'
import tabsTheme from './components/Tabs'
import { colors } from './colors'
import Badge from './components/Badge'
import { global } from './global'
import Button from './components/Button'
import Progress from './components/Progress'
import Popover from './components/Popover'
import Tooltip from './components/Tooltip'
import Input from './components/Input'
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
  breakpoints: {
    '2xl': '96em', // 1536px
    '3xl': '120em' // 1920px
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
  sizes: {
    container: {
      xl: '1310px',
      maxPageW: '1920px',
      maxNavigationW: 'none'
    }
  },
  blockOffset: [3, 4, 5, 5, 10],
  initialColorMode: 'dark',
  useSystemColorMode: false,
  colors,
  radii: {
    block: '30px'
  },
  styles: {
    global
  },
  components: {
    Tabs: tabsTheme,
    Container: {
      baseStyle: {
        p: 3
      },
      sizes: {
        xl: {
          background: 'red',
          maxW: '100px'
        }
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
    Button,
    Badge,
    Progress,
    Popover,
    Tooltip,
    Input
  }
})

export default theme
