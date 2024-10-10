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
        maxW={'1440px'}
        py={3}
        px={[0, 0, 0, 3]}
        pt={0}
        mt={8}
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
