import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme( {
    initialColorMode: 'dark',
    useSystemColorMode: false,
    colors: {
      brand: {
        normal: '#008DE4',
        deep: '#0E75B5'
      },
      gray: {
        50: "#f0f1f2",
        100: "#e0e3e5",
        200: "#c6cacd",
        300: "#acb1b4",
        400: "#94999c",
        500: "#7b7f83",
        600: "#62676a",
        700: "#494e51",
        800: "#313639",
        900: "#181d20"
      },
    },
    styles: {
      global: {
        'html, body': {
          background: '#181d20',
        },
      },
    },
    components: {
      Container: {
        baseStyle: {
          p: 3,
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

  // localStorage.setItem('chakra-ui-color-mode', 'dark')

export default theme