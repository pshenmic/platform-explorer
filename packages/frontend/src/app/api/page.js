import Markdown from '../../components/markdown'
import content from './content.md'
import './Api.scss'

import {
    Container,
    Heading,
} from '@chakra-ui/react'

export const metadata = {
    title: 'API — Dash Platform Explorer',
    description: '',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'block', 'Timestamp', 'Transactions', 'Block'],
    applicationName: 'Dash Platform Explorer'
}

async function ApiRoute() {
    return (
        <Container
            maxW='container.lg'
            color='white'
            mt={8}
            mb={8}
            className={'Api'}
        >
            <Container
                maxW='container.lg'
                _dark={{ color: "white" }}
                borderWidth='1px' borderRadius='lg'
                className={'InfoBlock'}
            >
                <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Dash Platform Explorer API</Heading>
                <Markdown>{content}</Markdown>
            </Container>
        </Container>
    )
}

export default ApiRoute
