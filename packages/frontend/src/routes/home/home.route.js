import React from 'react';
import * as Api from "../../util/Api";
import './home.css'
import {useLoaderData} from "react-router-dom";
import TransactionsList from '../../components/transactions/TransactionsList'
import BlocksList from '../../components/blocks/BlocksList'

import { 
    Box, 
    Text, 
    Container,
    Heading, 
    Flex,
    Stack,
    StackDivider
} from "@chakra-ui/react";


export async function loader({}) {
    const [status, paginatedTransactions, paginatedBlocks] = await Promise.all([
        Api.getStatus(), 
        Api.getTransactions(1, 10, 'desc'),
        Api.getBlocks(1, 10, 'desc')
    ])

    const transactions = paginatedTransactions.resultSet
    const blocks = paginatedBlocks.resultSet

    return {status, transactions, blocks}
}

function HomeRoute() {
    const {status, transactions, blocks} = useLoaderData();

    const {tenderdashVersion, network, appVersion, p2pVersion, blockVersion, blocksCount} = status

    return (
        <Container 
            maxW='container.xl' 
            _dark={{ color: "white" }}
            padding={3}
            mt={8}
            className='data_contract'
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
                    divider={<StackDivider borderColor='gray.200' />}
                >
                    <Box w={['100%', , '33%']}>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>Network: </Text>
                            <Box>{network}</Box>
                        </Flex>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>Blocks:</Text>
                            <Box>{blocksCount}</Box>
                        </Flex>

                    </Box>

                    <Box w={['100%', , '33%']}>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>Block version:</Text>
                            <Box>{blockVersion}</Box>
                        </Flex>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>P2P version:</Text>
                            <Box>{p2pVersion}</Box>
                        </Flex>

                    </Box>

                    <Box w={['100%', , '33%']}>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>Tenderdash Version:</Text>
                            <Box>{tenderdashVersion}</Box>
                        </Flex>

                        <Flex wrap={'wrap'}>
                            <Text as={'b'} mr={4}>App Version:</Text>
                            <Box>{appVersion}</Box>
                        </Flex>

                    </Box>

                </Stack>
            </Container>

            <Flex 
                w='100%' 
                justifyContent='space-between'
                wrap={["wrap", , , 'nowrap']}
                mt={4}
            >

                <Container
                    width={["100%", , ,"50%"]}
                    maxW='none'
                    m={0}
                    borderWidth='1px' borderRadius='lg'
                    className='InfoBlock'
                >
                    <Heading className='InfoBlock__Title' as='h1' size='sm'>Last blocks</Heading>

                    <BlocksList blocks={blocks} size='m'/>

                </Container>

                <Box w={5} h={5} />

                <Container
                    width={["100%", , ,"50%"]}
                    maxW='none'
                    m={0}
                    borderWidth='1px' borderRadius='lg'
                    className='InfoBlock'
                >
                    <Heading className='InfoBlock__Title' as='h1' size='sm'>Last transaction</Heading>

                    <TransactionsList transactions={transactions} size='m'/>

                </Container>
            
            </Flex>
        </Container>
    );
}

export default HomeRoute;
