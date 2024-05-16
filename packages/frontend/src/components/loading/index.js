import { Container, Skeleton } from '@chakra-ui/react'
import './LoadingLine.scss'

function LoadingLine ({ w='100%', h='20px', className = '' }) {
  return  <Container p={0} w={w} h={h} maxW={'none'} className={`LoadingLine ${className}`}></Container>
}

export {
    LoadingLine
}
