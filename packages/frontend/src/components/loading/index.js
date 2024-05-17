import { Container } from '@chakra-ui/react'
import './LoadingLine.scss'
import './LoadingBlock.scss'

function LoadingLine ({ w = '100%', h = '20px', className = '' }) {
  return <Container p={0} w={w} h={h} maxW={'none'} className={`LoadingLine ${className}`}></Container>
}

function LoadingBlock ({ w = '100%', h = '100%', className = '' }) {
  return <Container w={w} h={h} maxW={'none'} className={`LoadingBlock ${className}`}></Container>
}

export {
  LoadingLine,
  LoadingBlock
}
