import { Container } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import './PageDataContainer.scss'
import BackButton from '../Buttons/BackButton'

function PageDataContainer ({ className, title, backLink, children }) {
  return (
    <Container
      className={`PageDataContainer ${className || ''}`}
      maxW={'none'}
      m={0}
      py={[4, 4, 4, 5]}
      mt={0}
    >
      <Container maxW={'container.maxPageW'} px={[0]} py={0}>
        <div className={'PageDataContainer__Header'}>
          <BackButton link={backLink} className={'PageDataContainer__BackLink'}>
            <ChevronLeftIcon w={4} h={4} color={'brand.normal'}/>
          </BackButton>
          {title && <div className={'PageDataContainer__Title'}>{title}</div>}
        </div>

        <div className={'PageDataContainer__Content'}>{children}</div>
      </Container>
    </Container>
  )
}

export default PageDataContainer
