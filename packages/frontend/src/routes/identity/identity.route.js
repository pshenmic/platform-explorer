import {useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './identity.scss'
import TransactionsList from "../../components/transactions/TransactionsList";
import DocumentsList from "../../components/documents/DocumentsList";
import DataContractsList from "../../components/dataContracts/DataContractsList";

import { 
    Box, 
    Container,
    TableContainer, Table, Thead, Tbody, Tr, Th, Td,
    Tabs, TabList, TabPanels, Tab, TabPanel,
    Flex, 
} from "@chakra-ui/react"


const documents = [
    {identifier: 'G6qfN3v5EsQG2UkAyLAbj7HhiD3CWQYcLx58sZ9ZXUuR'},
    {identifier: 'G6qfN3v5EsQG2UkAyLAbj7HhiD3CWQYcLx58sZ9ZXUuR'},
    {identifier: 'G6qfN3v5EsQG2UkAyLAbj7HhiD3CWQYcLx58sZ9ZXUuR'},
    {identifier: 'G6qfN3v5EsQG2UkAyLAbj7HhiD3CWQYcLx58sZ9ZXUuR'},
    {identifier: 'G6qfN3v5EsQG2UkAyLAbj7HhiD3CWQYcLx58sZ9ZXUuR'},
    {identifier: 'G6qfN3v5EsQG2UkAyLAbj7HhiD3CWQYcLx58sZ9ZXUuR'},
]

const dataContracts = [
    {identifier: 'H8nrKtTQcGAa8xXobuzyV31h3GjxrSzMtqPkWe2P927n'},
    {identifier: 'H8nrKtTQcGAa8xXobuzyV31h3GjxrSzMtqPkWe2P927n'},
    {identifier: 'H8nrKtTQcGAa8xXobuzyV31h3GjxrSzMtqPkWe2P927n'},
    {identifier: 'H8nrKtTQcGAa8xXobuzyV31h3GjxrSzMtqPkWe2P927n'},
    {identifier: 'H8nrKtTQcGAa8xXobuzyV31h3GjxrSzMtqPkWe2P927n'},
    {identifier: 'H8nrKtTQcGAa8xXobuzyV31h3GjxrSzMtqPkWe2P927n'},
]

const transactions = [
    {
        hash: 'BF240D753F5878FFD7A8AD224B148936BB666C17433CACD4B11E1B2B4142E934', 
        type: 'Documents batch',
        timestamp: '10/23/2023, 10:52:29 PM'
    },
    {
        hash: 'BF240D753F5878FFD7A8AD224B148936BB666C17433CACD4B11E1B2B4142E934', 
        type: 'Transfer',
        timestamp: '10/23/2023, 10:52:29 PM'
    },
    {
        hash: 'BF240D753F5878FFD7A8AD224B148936BB666C17433CACD4B11E1B2B4142E934', 
        type: 'Documents batch',
        timestamp: '10/23/2023, 10:52:29 PM'
    },
    {
        hash: 'BF240D753F5878FFD7A8AD224B148936BB666C17433CACD4B11E1B2B4142E934', 
        type: 'Documents batch',
        timestamp: '10/23/2023, 10:52:29 PM'
    },
    {
        hash: 'BF240D753F5878FFD7A8AD224B148936BB666C17433CACD4B11E1B2B4142E934', 
        type: 'Transfer',
        timestamp: '10/23/2023, 10:52:29 PM'
    },
]


export async function loader({params}) {
    const {identifier} = params

    return await Api.getIdentity('BJ3WqMH4HyvZZAPW8srpq41ne6qhR1e4VMaU6HbSW7Dg');
}

function IdentityRoute({ cookies, children }) {
    const identity = useLoaderData();

    return (
        <div className="block identity">
            <Container 
                maxW='container.xl' 
                padding={3}
                mt={8}
            >
                <Flex 
                    w='100%' 
                    justifyContent='space-between'
                    wrap={["wrap", , , 'nowrap']}
                >
                    <TableContainer 
                        width={["100%", , , "50%"]}
                        maxW='none'
                        borderWidth='1px' borderRadius='lg'
                        m={0}
                    >
                        <Table variant='simple'>
                            <Thead>
                                <Tr>
                                    <Th>Identity info</Th>
                                    <Th></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>Balance</Td>
                                    <Td isNumeric>1000 Credits</Td>
                                </Tr>
                                <Tr>
                                    <Td>Created</Td>
                                    <Td isNumeric>12.10.2023</Td>
                                </Tr>
                                <Tr>
                                    <Td>Updated</Td>
                                    <Td isNumeric>13.10.2023</Td>
                                </Tr>
                                <Tr>
                                    <Td>Revision</Td>
                                    <Td isNumeric>1</Td>
                                </Tr>
                                <Tr>
                                    <Td>Transactions</Td>
                                    <Td isNumeric>213</Td>
                                </Tr>
                                <Tr>
                                    <Td>Documents</Td>
                                    <Td isNumeric>123</Td>
                                </Tr>
                                <Tr>
                                    <Td>Data contracts</Td>
                                    <Td isNumeric>1233</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>

                    <Box w={5} h={5} />

                    <Container
                        width={["100%", , ,"50%"]}
                        maxW='none'
                        m={0}
                        borderWidth='1px' borderRadius='lg'
                        className="InfoBlock"
                    >
                        <Tabs>
                            <TabList>
                                <Tab>Transactions</Tab>
                                <Tab>Documents</Tab>
                                <Tab>Data contracts</Tab>
                            </TabList>

                            <TabPanels>

                                <TabPanel>
                                    <Box>
                                        <TransactionsList items={transactions}/>
                                    </Box>
                                </TabPanel>

                                <TabPanel>
                                    <Box>
                                        <DocumentsList items={documents}/>
                                    </Box>

                                </TabPanel>

                                <TabPanel>
                                    <Box>
                                        <DataContractsList items={dataContracts}/>
                                    </Box>
                                </TabPanel>

                                <TabPanel>
                                    <Box>
                                        credit transfers related to this identity (topup + transfer + withdrawals)
                                    </Box>
                                </TabPanel>

                            </TabPanels>
                        </Tabs>
                    </Container>
                </Flex>
            </Container>
        </div>
    );
}

export default IdentityRoute;
