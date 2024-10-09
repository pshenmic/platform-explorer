import { Box, Heading, Text } from '@chakra-ui/react'
import NetworkStatus from '../../components/networkStatus'
import './HomeIntro.scss'

export default function HomeIntro () {
  return (
    <Box className={'InfoBlock HomeIntro'}>
      <div className={'HomeIntro__About'}>
        <Text size={'sm'} mt={0} mb={2} className={'HomeIntro__Welcome'}>
          WELCOME TO
        </Text>
        <Heading as={'h1'} className={'HomeIntro__Title'}>
          Platform Explorer
        </Heading>
        <Heading as={'h2'} className={'HomeIntro__Subtitle'}>
          The information resource about Dash Platform!
        </Heading>
        <Text className={'HomeIntro__Description'}>
          Dive into the world of Dash Platform with Platform Explorer, your trusted portal for real-time and historical data across the blockchain ecosystem. Our platform offers a view of blockchain&apos;s continuous evolution, enabling you to track and verify transactions with confidence and precision.
        </Text>
      </div>

      <NetworkStatus className={'HomeIntro__NetworkStatus'}/>
    </Box>
  )
}
