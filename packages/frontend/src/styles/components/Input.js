const Input = {
  baseStyle: {
    field: {
      fontSize: '0.75rem',
      fontFamily: 'mono',
      borderRadius: '10px',
      fontWeight: '400',
      transition: '.1s',
      border: '1px solid #39454C',
      _focus: {
        borderColor: 'blue.500',
        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
      }
    }
  },
  variants: {
    outline: {
      field: {
        bg: 'rgba(var(--chakra-colors-gray-800-rgb), 0.5)'
      }
    }
  }
}

export default Input
