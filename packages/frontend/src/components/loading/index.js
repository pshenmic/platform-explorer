import { Container } from '@chakra-ui/react'
import './LoadingLine.scss'
import './LoadingBlock.scss'

function LoadingLine ({ children, loading, w = '100%', h = '20px', className = '' }) {
  if (children === undefined || loading) {
    return <Container p={0} w={w} h={h} maxW={'none'} className={`LoadingLine ${className}`}></Container>
  }

  return <>{children}</>
}

function LoadingBlock ({ children, loading, w = '100%', h = '100%', className = '' }) {
  if (children === undefined || loading) {
    return <Container w={w} h={h} maxW={'none'} className={`LoadingBlock ${className}`}></Container>
  }

  return <>{children}</>
}

export {
  LoadingLine,
  LoadingBlock
}
