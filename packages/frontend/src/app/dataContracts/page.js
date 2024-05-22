import DataContracts from './DataContracts'
import Intro from '../../components/intro/index.js'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import { Container } from '@chakra-ui/react'

export const metadata = {
  title: 'Data Contracts — Dash Platform Explorer',
  description: 'Data Contracts on Dash Platform. The Identifier, Date of Creation.',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'data contrancts', 'Datacontract', 'Identifier', 'Date of Creation'],
  applicationName: 'Dash Platform Explorer'
}

function DataContractsRoute () {
  return <>
    <Container
      maxW={'container.lg'}
      color={'white'}
      mt={8}
      mb={0}
    >
        <Intro
            title={'Data contracts'}
            contentSource={<Markdown>{introContent}</Markdown>}
        />
    </Container>
    <DataContracts/>
  </>
}

export default DataContractsRoute
