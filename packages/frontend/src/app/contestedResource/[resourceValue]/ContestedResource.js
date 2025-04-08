'use client'

import { useState, useEffect } from 'react'
// import * as Api from '../../../util/Api'
// import { fetchHandlerSuccess, fetchHandlerError, setLoadingProp } from '../../../util'
// import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'

// const pagintationConfig = {
//   itemsOnPage: {
//     default: 10,
//     values: [10, 25, 50, 75, 100]
//   },
//   defaultPage: 1
// }

const tabs = [
  'All votes',
  'Towards Identity',
  'Abstain',
  'Locked'
]

const defaultTabName = 'documents'

function ContestedResource ({ identifier }) {
  const { setBreadcrumbs } = useBreadcrumbs()
  const [contestedResource] = useState({ data: {}, loading: true, error: false })
  // const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const [activeTab, setActiveTab] = useState(tabs.indexOf(defaultTabName.toLowerCase()) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase()) : 0)
  // const router = useRouter()
  // const pathname = usePathname()
  // const searchParams = useSearchParams()

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Contested Resources', path: '/contestedResources' },
      { label: contestedResource.data?.name || identifier, avatarSource: identifier }
    ])
  }, [setBreadcrumbs, identifier, contestedResource])

  return (
    <PageDataContainer
      className={'ContestedResource'}
      title={'Contested Resource info'}
    >
      <div className={'ContestedResource__InfoBlocks'}>
        Cards
      </div>

      <InfoContainer styles={['tabs']}>
        <Tabs onChange={(index) => setActiveTab(index)} index={activeTab}>
          <TabList>
            <Tab>
              All votes
              <span className={'Tabs__TabItemsCount'}>
                111
              </span>
            </Tab>
            <Tab>
              Towards Identity
              <span className={'Tabs__TabItemsCount'}>
                111
              </span>
            </Tab>
            <Tab>
              ABSTAIN
              <span className={'Tabs__TabItemsCount Tabs__TabItemsCount--Empty'}>
                0
              </span>
            </Tab>
            <Tab>
              Locked
              <span className={'Tabs__TabItemsCount'}>
                111
              </span>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel position={'relative'}>
              All votes
            </TabPanel>
            <TabPanel position={'relative'}>
              Towards Identity
            </TabPanel>
            <TabPanel position={'relative'}>
              ABSTAIN
            </TabPanel>
            <TabPanel position={'relative'}>
              Locked
            </TabPanel>
          </TabPanels>
        </Tabs>
      </InfoContainer>
    </PageDataContainer>
  )
}

export default ContestedResource
