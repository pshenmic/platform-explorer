import DataContracts from './DataContracts'
import Intro from '../../components/intro'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import { Container } from '@chakra-ui/react'
import Cards from './Cards'

export const metadata = {
  title: 'Data Contracts — Dash Platform Explorer',
  description: 'Data Contracts on Dash Platform. The Identifier, Date of Creation.',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'data contrancts', 'Datacontract', 'Identifier', 'Date of Creation'],
  applicationName: 'Dash Platform Explorer'
}

function DataContractsRoute ({ searchParams }) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams['page-size'])

  return <>
    <Container
      maxW={'container.xl'}
      color={'white'}
      px={0}
      mt={8}
      mb={0}
    >
      <Intro
        title={'Data contracts'}
        description={<Markdown>{introContent}</Markdown>}
        block={<Cards/>}
      />
    </Container>
    <DataContracts defaultPage={page} defaultPageSize={pageSize}/>
  </>
}

export default DataContractsRoute
