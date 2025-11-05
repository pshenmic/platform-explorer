import * as Api from '@utils/Api'

import DataContracts from './DataContracts'
import Intro from '../../components/intro'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import { Container } from '@chakra-ui/react'
import Cards from './Cards'
import './DataContractsIntro.scss'
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query'

export const metadata = {
  title: 'Data Contracts — Dash Platform Explorer',
  description: 'Data Contracts on Dash Platform. The Identifier, Date of Creation.',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'data contrancts', 'Datacontract', 'Identifier', 'Date of Creation'],
  applicationName: 'Dash Platform Explorer'
}


  const sorting = { order: 'asc', orderBy: 'block_height' }; // Замени на реальную логику
  const filters = {}; // Замени на реальную логику, если filters из URL или другого источника

  const queryClient = new QueryClient();

async function DataContractsRoute ({ searchParams }) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams['page-size'])


  await queryClient.prefetchQuery({
    queryKey: ['dataContracts'],
    queryFn: () => {
      console.log('page')
      return Api.getDataContracts(
      page,
      pageSize,
      sorting.order,
      sorting.orderBy,
      filters
    )},
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Container
        maxW={'container.maxPageW'}
        color={'white'}
        mt={8}
        mb={0}
        >
        <Intro
          className={'DataContractsIntro'}
          title={'Data contracts'}
          description={<Markdown>{introContent}</Markdown>}
          block={<Cards/>}
          />
      </Container>
      <DataContracts defaultPage={page} defaultPageSize={pageSize}/>
    </HydrationBoundary>
  )
}

export default DataContractsRoute
