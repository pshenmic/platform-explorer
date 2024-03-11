'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../util/Api'
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


export async function loader() {
    const [status, paginatedTransactions] = await Promise.all([
        Api.getStatus(), 
        Api.getTransactions(1, 25, 'desc')
    ])

    const transactions = paginatedTransactions.resultSet

    return {status, transactions}
}

function Home() {
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState(true)
    const [transactions, setTransactions] = useState([])

    const fetchData = () => {
        setLoading(true)

        try {
            loader().then((res) => {

                setStatus(res.status)
                setTransactions(res.transactions)
                setLoading(false)

            })
        } catch(error) {
            console.log(error)
        }
        
    }

    useEffect(fetchData, [])
    
    if (!loading) return (
        <Container 
            maxW='container.lg' 
            color= {"white"} 
            padding={3}
            mt={8}
            mb={4}
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
                                <Box>{status.network}</Box>
                            </Flex>

                            <Flex wrap={'wrap'}>
                                <Text as={'b'} mr={4}>Tenderdash Version:</Text>
                                <Box>{status.tenderdashVersion}</Box>
                            </Flex>

                            <Flex wrap={'wrap'}>
                                <Text as={'b'} mr={4}>App Version:</Text>
                                <Box>{status.appVersion}</Box>
                            </Flex>

                        </Box>

                        <Box w={['100%', , '33%']}>

                            <Flex wrap={'wrap'}>
                                <Text as={'b'} mr={4}>Average block time:</Text>
                                <Box>{Math.ceil(status.blockTimeAverage)} sec.</Box>
                            </Flex>

                            <Flex wrap={'wrap'}>
                                <Text as={'b'} mr={4}>Blocks:</Text>
                                <Box>{status.blocksCount}</Box>
                            </Flex>

                            <Flex wrap={'wrap'}>
                                <Text as={'b'} mr={4}>Transactions:</Text>
                                <Box>{status.txCount}</Box>
                            </Flex>

                        </Box>

                        <Box w={['100%', , '33%']}>

                            <Flex wrap={'wrap'}>
                                <Text as={'b'} mr={4}>Data contracts:</Text>
                                <Box>{status.dataContractsCount}</Box>
                            </Flex>

                            <Flex wrap={'wrap'}>
                                <Text as={'b'} mr={4}>Documents:</Text>
                                <Box>{status.documentsCount}</Box>
                            </Flex>

                            <Flex wrap={'wrap'}>
                                <Text as={'b'} mr={4}>Transfers:</Text>
                                <Box>{status.transfersCount}</Box>
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

export default Home;
