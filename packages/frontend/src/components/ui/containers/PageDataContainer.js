import { Container } from '@chakra-ui/react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import './PageDataContainer.scss'

function PageDataContainer ({ title, backLink, children }) {
  return (
    <Container
      className={'PageDataContainer'}
      maxW={'none'}
      m={0}
      py={3}
      mt={[0, 0, 0, 8]}
    >
      <Container maxW={'container.maxPageW'} px={[0, 0, 0, 5, 8]} pt={0}>
        <div className={'PageDataContainer__Header'}>
          {backLink &&
            <Link href={backLink} className={'PageDataContainer__BackLink'}>
              <ChevronLeftIcon w={4} h={4} color='brand.normal'/>
            </Link>}
          {title && <div className={'PageDataContainer__Title'}>{title}</div>}
        </div>

        <div className={'PageDataContainer__Content'}>{children}</div>
      </Container>
    </Container>
  )
}

export default PageDataContainer
