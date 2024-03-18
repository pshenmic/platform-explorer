import Markdown from 'react-markdown'
import content from './content.md'

import {
    Container,
    Heading, 
} from '@chakra-ui/react'

export const metadata = {
    title: 'Api — Dash Platform Explorer',
    description: '',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'block', 'Timestamp', 'Transactions', 'Block'],
    applicationName: 'Dash Platform Explorer'
}

async function ApiRoute({ params }) {
    return (
        <Container 
            maxW='container.lg' 
            color='white'
            mt={8}
            mb={8}
            className={'Blocks'}
        >
            <Container 
                maxW='container.lg' 
                _dark={{ color: "white" }}
                borderWidth='1px' borderRadius='lg'
                className={'InfoBlock'}
            >
                <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Dash Platform Explorer Api</Heading>
                <Markdown>{content}</Markdown>
            </Container>
        </Container>
    )
}

export default ApiRoute
