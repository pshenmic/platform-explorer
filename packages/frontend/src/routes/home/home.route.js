import React from 'react'
import * as Api from '../../util/Api'
import './home.css'
import {useLoaderData} from 'react-router-dom'
import TransactionsList from '../../components/transactions/TransactionsList'

import { 
    Box, 
    Text, 
    Container,
    Heading, 
    Flex,
    Stack,
    StackDivider
} from '@chakra-ui/react'


export async function loader({}) {
    const [status, paginatedTransactions] = await Promise.all([
        Api.getStatus(), 
        Api.getTransactions(1, 25, 'desc')
    ])

    const transactions = paginatedTransactions.resultSet

    return {status, transactions}
}

function HomeRoute() {
    const {status, transactions} = useLoaderData();

    const {tenderdashVersion, network, appVersion, p2pVersion, blockVersion, blocksCount} = status

    return (
        <Container 
            maxW='container.lg' 
            _dark={{ color: "white" }}
            padding={3}
            mt={8}
            mb={4}
            className={'data_contract'}
        >
            <Container 
                width='100%'
                maxW='none'
                mt={5}
                mb={[10,,16]}
                borderWidth={['1px' , , '0']} 
                borderRadius='lg'

            >
                <Stack 
                    direction={['column', , 'row']} 
                    spacing='24px'
                    divider={<StackDivider borderColor='gray.700' />}
                >
                    <Box w={['100%', , '33%']}>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>Network: </Text>
                            <Box>{network}</Box>
                        </Flex>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>Tenderdash Version:</Text>
                            <Box>{tenderdashVersion}</Box>
                        </Flex>

                    </Box>

                    <Box w={['100%', , '33%']}>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>Blocks:</Text>
                            <Box>{blocksCount}</Box>
                        </Flex>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>Block version:</Text>
                            <Box>{blockVersion}</Box>
                        </Flex>

                    </Box>

                    <Box w={['100%', , '33%']}>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>App Version:</Text>
                            <Box>{appVersion}</Box>
                        </Flex>

                    </Box>

                </Stack>
            </Container>

            <Container
                maxW='container.lg'
                m={0}
                borderWidth='1px' borderRadius='lg'
                className={'InfoBlock'}
            >
                <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Last transaction</Heading>

                <TransactionsList transactions={transactions} />

            </Container>
        </Container>
    );
}

export default HomeRoute;
