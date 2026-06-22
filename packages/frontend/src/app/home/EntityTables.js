'use client'

import Link from 'next/link'
import { Box, Flex, Heading } from '@chakra-ui/react'
import BlocksList from '../../components/blocks/BlocksList'
import TransactionsList from '../../components/transactions/TransactionsList'
import DataContractsList from '../../components/dataContracts/DataContractsList'
import IdentitiesList from '../../components/identities/IdentitiesList'
import { ErrorMessageBlock } from '../../components/Errors'
import { LoadingList } from '../../components/loading'

function Panel ({ state, children }) {
  if (state.loading) return <LoadingList itemsCount={state.props?.printCount || 10}/>
  if (state.error) return <ErrorMessageBlock/>
  return children
}

function Section ({ title, viewAll, state, children }) {
  return (
    <Box className={'InfoBlock InfoBlock--NoBorder'} w={'100%'}>
      <Flex justifyContent={'space-between'} alignItems={'center'} mb={2}>
        <Heading className={'InfoBlock__Title'} as={'h2'}>{title}</Heading>
        <Link href={viewAll} className={'HomeSection__ViewAll'}>Show more</Link>
      </Flex>
      <Panel state={state}>{children}</Panel>
    </Box>
  )
}

function EntityTables ({ blocks, transactions, dataContracts, identities, rate }) {
  return (
    <Flex direction={'column'} gap={3} w={'100%'} className={'EntityTables'}>
      <Section title={'Latest Blocks'} viewAll={'/blocks'} state={blocks}>
        <BlocksList blocks={blocks.data?.resultSet || []}/>
      </Section>

      <Section title={'Latest Transactions'} viewAll={'/transactions'} state={transactions}>
        <TransactionsList transactions={transactions.data?.resultSet || []} rate={rate?.data}/>
      </Section>

      <Section title={'Latest Data Contracts'} viewAll={'/dataContracts'} state={dataContracts}>
        <DataContractsList dataContracts={dataContracts.data?.resultSet || []}/>
      </Section>

      <Section title={'Latest Identities'} viewAll={'/identities'} state={identities}>
        <IdentitiesList identities={identities.data?.resultSet || []}/>
      </Section>
    </Flex>
  )
}

export default EntityTables
