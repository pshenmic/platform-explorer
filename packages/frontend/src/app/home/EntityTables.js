'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tabs, TabList, TabPanels, Tab, TabPanel, Flex } from '@chakra-ui/react'
import BlocksList from '../../components/blocks/BlocksList'
import TransactionsList from '../../components/transactions/TransactionsList'
import DataContractsList from '../../components/dataContracts/DataContractsList'
import IdentitiesList from '../../components/identities/IdentitiesList'
import { ErrorMessageBlock } from '../../components/Errors'
import { LoadingList } from '../../components/loading'

const TABS = [
  { key: 'blocks', label: 'Blocks', viewAll: '/blocks' },
  { key: 'transactions', label: 'Transactions', viewAll: '/transactions' },
  { key: 'dataContracts', label: 'Data Contracts', viewAll: '/dataContracts' },
  { key: 'identities', label: 'Identities', viewAll: '/identities' }
]

function Panel ({ state, children }) {
  if (state.loading) return <LoadingList itemsCount={state.props?.printCount || 10}/>
  if (state.error) return <ErrorMessageBlock/>
  return children
}

function EntityTables ({ blocks, transactions, dataContracts, identities, rate }) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className={'InfoBlock InfoBlock--NoBorder'}>
      <Tabs onChange={setActiveTab} index={activeTab} className={'EntityTables'} isLazy>
        <Flex justifyContent={'space-between'} alignItems={'center'} wrap={'wrap'} gap={2}>
          <TabList>
            {TABS.map(t => <Tab key={t.key}>{t.label}</Tab>)}
          </TabList>
          <Link href={TABS[activeTab].viewAll} className={'HomeSection__ViewAll'}>View all</Link>
        </Flex>

        <TabPanels>
          <TabPanel px={0}>
            <Panel state={blocks}>
              <BlocksList blocks={blocks.data?.resultSet || []} headerStyles={'light'}/>
            </Panel>
          </TabPanel>

          <TabPanel px={0}>
            <Panel state={transactions}>
              <TransactionsList transactions={transactions.data?.resultSet || []} rate={rate?.data}/>
            </Panel>
          </TabPanel>

          <TabPanel px={0}>
            <Panel state={dataContracts}>
              <DataContractsList dataContracts={dataContracts.data?.resultSet || []}/>
            </Panel>
          </TabPanel>

          <TabPanel px={0}>
            <Panel state={identities}>
              <IdentitiesList identities={identities.data?.resultSet || []}/>
            </Panel>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  )
}

export default EntityTables
