'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useQueryState, parseAsStringEnum } from 'nuqs'
import { Container, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import * as Api from '../../../util/Api'
import { PageDataContainer, InfoContainer } from '../../../components/ui/containers'
import { ErrorMessageBlock } from '../../../components/Errors'
import { TransactionsList } from '../../../components/transactions'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { PlatformAddressTotalCard } from '../../../components/platformAddresses'
import './PlatformAddress.scss'

const tabs = ['transitions']

const pageSize = 10

function PlatformAddress () {
  const { hash } = useParams()
  const { setBreadcrumbs } = useBreadcrumbs()
  const [txPage, setTxPage] = useState(1)

  const address = useQuery({
    queryKey: ['platformAddress', hash],
    queryFn: () => Api.getPlatformAddressInfo(hash),
    enabled: !!hash
  })

  const rate = useQuery({
    queryKey: ['rate'],
    queryFn: () => Api.getRate()
  })

  const transitions = useQuery({
    queryKey: ['platformAddressTransitions', hash, txPage],
    queryFn: () => Api.getPlatformAddressTransitions(hash, txPage, pageSize, 'desc'),
    enabled: !!hash
  })

  const [activeTab, setActiveTab] = useQueryState(
    'tab',
    parseAsStringEnum(tabs)
      .withDefault('transitions')
      .withOptions({ scroll: false, shallow: false })
  )

  const handleTab = (index) => setActiveTab(tabs[index])

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Platform Addresses', path: '/platformAddresses' },
      { label: hash }
    ])
  }, [setBreadcrumbs, hash])

  return (
    <PageDataContainer className={'PlatformAddress'} title={'Platform Address Info'}>
      {address.isError
        ? <ErrorMessageBlock h={'450px'} />
        : <PlatformAddressTotalCard address={address} rate={rate} />
      }

      <InfoContainer styles={['tabs']} id={'tabs'}>
        <Tabs onChange={handleTab} index={tabs.indexOf(activeTab)}>
          <TabList>
            <Tab>
              Transitions {transitions.data?.pagination?.total != null
              ? <span className={`Tabs__TabItemsCount ${transitions.data.pagination.total === 0 ? 'Tabs__TabItemsCount--Empty' : ''}`}>
                  {transitions.data.pagination.total}
                </span>
              : ''}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel position={'relative'}>
              {!transitions.isError
                ? <TransactionsList
                    transactions={transitions.data?.resultSet}
                    loading={transitions.isLoading}
                    pagination={{
                      onPageChange: (pagination) => setTxPage(pagination.selected + 1),
                      pageCount: Math.ceil((transitions.data?.pagination?.total || 0) / pageSize) || 1,
                      forcePage: txPage - 1
                    }}
                  />
                : <Container h={20}><ErrorMessageBlock /></Container>
              }
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>
    </PageDataContainer>
  )
}

export default PlatformAddress
