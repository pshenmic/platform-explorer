import Validators from './Validators'
import { ValidatorsDashboardCards } from '../../components/validators'
import Intro from '../../components/intro'
import Markdown from '../../components/markdown'
import introContent from './intro.md'
import { Container } from '@chakra-ui/react'
import './ValidatorsIntro.scss'

export const metadata = {
  title: 'Validators — Dash Platform Explorer',
  description: 'All validators on Dash Platform. Statistics and status of validators on Dash Platform.',
  keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Validators'],
  applicationName: 'Dash Platform Explorer'
}

function ValidatorsRoute ({ searchParams }) {
  const page = Number(searchParams.page) || 1
  const pageSize = Number(searchParams['page-size'])
  const activeState = searchParams['active-state']

  return <>
    <Container
      maxW={'container.maxPageW'}
      color={'white'}
      mt={8}
      mb={0}
    >
      <Intro
        className={'ValidatorsIntro'}
        title={'Validators'}
        description={<Markdown>{introContent}</Markdown>}
        block={<ValidatorsDashboardCards/>}
      />
    </Container>
    <Validators defaultPage={page} defaultPageSize={pageSize} defaultIsActive={activeState}/>
  </>
}

export default ValidatorsRoute
