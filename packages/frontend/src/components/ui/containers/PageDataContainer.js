import { Container } from '@chakra-ui/react'

function PageDataContainer ({ children }) {
  return (
    <Container
      className={'PageDataContainer'}
      maxW={'container.xl'}
      p={3}
      mt={8}
      bg={'rgba(255,255,255,.1)'}
    >
      {children}
    </Container>
  )
}

export default PageDataContainer
