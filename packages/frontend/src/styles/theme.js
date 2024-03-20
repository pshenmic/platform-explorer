import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme( {
    config: {
      useSystemColorMode: false,
      initialColorMode: 'dark',
    },
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
        '*' : {
          borderColor: 'gray.800'
        },
        'html, body': {
          background: '#181d20',
          color: 'white'
        }
      },
    },
    components: {
      Container: {
        baseStyle: {
          p: 3,
        },
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