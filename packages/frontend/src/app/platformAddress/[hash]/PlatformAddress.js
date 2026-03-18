'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useQueryState, parseAsStringEnum } from 'nuqs'
import { Container, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import * as Api from '../../../util/Api'
import { InfoLine, CreditsBlock, Identifier, NotActive } from '../../../components/data'
import { PageDataContainer, InfoContainer } from '../../../components/ui/containers'
import { ErrorMessageBlock } from '../../../components/Errors'
import { TransactionsList } from '../../../components/transactions'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
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
        : (
          <div className={'PlatformAddress__CommonInfo'}>
            <InfoLine
              title={'Bech32m Address'}
              value={
                <Identifier copyButton={true} ellipsis={false} styles={['highlight-both']}>
                  {address.data?.bech32mAddress}
                </Identifier>
              }
              loading={address.isLoading}
              error={address.isError}
            />

            <InfoLine
              title={'Balance'}
              value={<CreditsBlock credits={address.data?.balance} rate={rate} />}
              loading={address.isLoading}
              error={address.isError}
            />

            <InfoLine
              title={'Nonce'}
              value={address.data?.nonce ?? <NotActive />}
              loading={address.isLoading}
              error={address.isError}
            />

            <InfoLine
              title={'Total Transactions'}
              value={address.data?.totalTxs ?? <NotActive />}
              loading={address.isLoading}
              error={address.isError}
            />

            <InfoLine
              title={'Incoming Transactions'}
              value={address.data?.incomingTxs ?? <NotActive />}
              loading={address.isLoading}
              error={address.isError}
            />

            <InfoLine
              title={'Outgoing Transactions'}
              value={address.data?.outgoingTxs ?? <NotActive />}
              loading={address.isLoading}
              error={address.isError}
            />

            <InfoLine
              title={'Total Incoming Amount'}
              value={address.data?.totalIncomingAmount != null
                ? <CreditsBlock credits={address.data.totalIncomingAmount} rate={rate} />
                : <NotActive />}
              loading={address.isLoading}
              error={address.isError}
            />

            <InfoLine
              title={'Total Outgoing Amount'}
              value={address.data?.totalOutgoingAmount != null
                ? <CreditsBlock credits={address.data.totalOutgoingAmount} rate={rate} />
                : <NotActive />}
              loading={address.isLoading}
              error={address.isError}
            />
          </div>
        )
      }

      <InfoContainer styles={['tabs']} id={'tabs'}>
        <Tabs onChange={handleTab} index={tabs.indexOf(activeTab)}>
          <TabList>
            <Tab>
              Transitions{transitions.data?.pagination?.total != null
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
