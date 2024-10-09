import { Container } from '@chakra-ui/react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import './PageDataContainer.scss'

function PageDataContainer ({ title, backLink, children }) {
  return (
    <Container
      maxW={'none'}
      m={0}
      py={3}
    >
      <Container
        className={'PageDataContainer'}
        maxW={'container.xl'}
        p={3}
        pt={0}
        mt={8}
        bg={'gray.675'}
      >
        <div className={'PageDataContainer__Header'}>
          {backLink &&
            <Link href={backLink} className={'PageDataContainer__BackLink'}>
              <ChevronLeftIcon w={4} h={4} color='brand.normal'/>
            </Link>}
          {title && <div className={'PageDataContainer__Title'}>{title}</div>}
        </div>

        <div>{children}</div>
      </Container>
    </Container>
  )
}

export default PageDataContainer
