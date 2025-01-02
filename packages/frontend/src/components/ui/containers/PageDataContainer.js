import { Container } from '@chakra-ui/react'
import { ChevronIcon2 } from '../icons'
import BackButton from '../Buttons/BackButton'
import './PageDataContainer.scss'

function PageDataContainer ({ className, title, children }) {
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
          <BackButton className={'PageDataContainer__BackLink'}>
            <ChevronIcon2 w={'8px'} h={'8px'} color={'brand.normal'}/>
          </BackButton>
          {title && <div className={'PageDataContainer__Title'}>{title}</div>}
        </div>

        <div className={'PageDataContainer__ContentContainer'}>
          <div className={'PageDataContainer__Content'}>{children}</div>
        </div>
      </Container>
    </Container>
  )
}

export default PageDataContainer
