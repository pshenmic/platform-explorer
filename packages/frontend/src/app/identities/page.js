import Identities from './Identities'
import Intro from '../../components/intro/index.js'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import {
  Container
} from '@chakra-ui/react'

export const metadata = {
  title: 'Identities — Dash Platform Explorer',
  description: 'Identities on Dash Platform. The Identifier, Date of Creation',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identities'],
  applicationName: 'Dash Platform Explorer'
}

function IdentitiesRoute () {
  return <>
    <Container
      maxW={'container.lg'}
      color={'white'}
      mt={8}
      mb={0}
    >
        <Intro
            title={'Identities'}
            contentSource={<Markdown>{introContent}</Markdown>}
        />
    </Container>
    <Identities/>
  </>
}

export default IdentitiesRoute
