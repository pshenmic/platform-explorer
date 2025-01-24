export const global = {
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
