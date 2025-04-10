'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import {
  // usePathname, useRouter,
  useSearchParams
} from 'next/navigation'
import { InfoContainer, PageDataContainer } from '../../../components/ui/containers'
import { Tabs, TabList, TabPanels, Tab, TabPanel, Code, Box } from '@chakra-ui/react'
import { useBreadcrumbs } from '../../../contexts/BreadcrumbsContext'
import { ContestedResourcesTotalCard } from '../../../components/contestedResources'

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

const defaultTabName = 'All votes'

function ContestedResource ({ resourceValue }) {
  const { setBreadcrumbs } = useBreadcrumbs()
  const [contestedResource, setContestedResource] = useState({ data: {}, loading: true, error: false })
  // const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const [activeTab, setActiveTab] = useState(tabs.indexOf(defaultTabName.toLowerCase()) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase()) : 0)
  // const router = useRouter()
  // const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Contested Resources', path: '/contestedResources' },
      { label: resourceValue }
    ])
  }, [setBreadcrumbs, resourceValue, contestedResource])

  useEffect(() => {
    Api.getContestedResourceByValue(resourceValue)
      .then(res => fetchHandlerSuccess(setContestedResource, res))
      .catch(err => fetchHandlerError(setContestedResource, err))
    //
    // Api.getRate()
    //   .then(res => fetchHandlerSuccess(setRate, res))
    //   .catch(err => fetchHandlerError(setRate, err))
  }, [resourceValue])

  useEffect(() => {
    const tab = searchParams.get('tab')

    if (tab && tabs.indexOf(tab.toLowerCase()) !== -1) {
      setActiveTab(tabs.indexOf(tab.toLowerCase()))
      return
    }

    setActiveTab(tabs.indexOf(defaultTabName.toLowerCase()) !== -1 ? tabs.indexOf(defaultTabName.toLowerCase()) : 0)
  }, [searchParams])

  console.log('contestedResource', contestedResource)
  console.log('contestedResource', JSON.stringify(contestedResource))

  return (
    <PageDataContainer
      className={'ContestedResource'}
      title={'Contested Resource info'}
    >
      <ContestedResourcesTotalCard contestedResource={contestedResource}/>

      <Box boxSize={'2rem'}/>

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

      <Code
        borderRadius={'lg'}
        px={5}
        py={4}
        mt={10}
      >
        {JSON.stringify(contestedResource.data, null, 2)}
      </Code>
    </PageDataContainer>
  )
}

export default ContestedResource
