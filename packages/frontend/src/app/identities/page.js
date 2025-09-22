import Identities from './Identities'
import Intro from '../../components/intro'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import { Container, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react'
import { InfoContainer } from '../../components/ui/containers'
import { TopIdentities } from '../../components/identities'
import IdentitiesGrowthChart from '../../components/charts/IdentitiesGrowthChart'
import './IdentitiesPage.scss'

export const metadata = {
  title: 'Identities — Dash Platform Explorer',
  description: 'Identities on Dash Platform. The Identifier, Date of Creation',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identities'],
  applicationName: 'Dash Platform Explorer'
}

function IdentitiesRoute ({ searchParams }) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams['page-size'])

  return <>
    <Container
      maxW={'container.maxPageW'}
      color={'white'}
      mt={8}
      mb={0}
    >
      <Intro
        title={'Identities'}
        description={<Markdown>{introContent}</Markdown>}
        block={
          <InfoContainer styles={['tabs']} className={'IdentitiesPage__IntroTabs'}>
            <Tabs>
              <TabList>
                <Tab>Top Identities</Tab>
                <Tab>Identities Growth</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <TopIdentities/>
                </TabPanel>
                <TabPanel>
                  <IdentitiesGrowthChart
                    blockBorders={false}
                    useInfoBlock={false}
                    className={'IdentitiesPage__IdentitiesCountChart'}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </InfoContainer>
        }
      />
    </Container>
    <Identities defaultPage={page} defaultPageSize={pageSize}/>
  </>
}

export default IdentitiesRoute
