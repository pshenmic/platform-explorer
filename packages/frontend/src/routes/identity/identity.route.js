import {useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import {Link} from "react-router-dom";
import TransactionsList from "../../components/transactions/TransactionsList";
import DocumentsList from "../../components/documents/DocumentsList";
import DataContractsList from "../../components/dataContracts/DataContractsList";
import './identity.scss'

import { 
    Box, 
    Container,
    TableContainer, Table, Thead, Tbody, Tr, Th, Td,
    Tabs, TabList, TabPanels, Tab, TabPanel,
    Flex, 
} from "@chakra-ui/react"


export async function loader({params}) {
    const {identifier} = params

    const [identity, dataContracts, documents, transactions, transfers] = await Promise.all([
        Api.getIdentity(identifier),
        Api.getDataContractsByIdentity(identifier),
        Api.getDocumentsByIdentity(identifier),
        Api.getTransactionsByIdentity(identifier),
        Api.getTransfersByIdentity(identifier),
    ])

    return {
        identity,
        dataContracts,
        documents,
        transactions,
        transfers
    };
}

function IdentityRoute({ cookies, children }) {
    const {
        identity, 
        dataContracts,
        documents, 
        transactions,
        transfers
    } = useLoaderData();

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
                        className="IdentityInfo"
                    >
                        <Table variant='simple' className="Table">
                            <Thead>
                                <Tr>
                                    <Th>Identity info</Th>
                                    <Th></Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>Identifier</Td>
                                    <Td isNumeric>{identity.identifier}</Td>
                                </Tr>
                                <Tr>
                                    <Td>Balance</Td>
                                    <Td isNumeric>{identity.balance} Credits</Td>
                                </Tr>
                                <Tr>
                                    <Td>Created</Td>
                                    <Td isNumeric> 
                                        <Link to={`/transaction/${identity.txHash}`}>
                                            {new Date(identity.timestamp).toLocaleString()}
                                        </Link>
                                    </Td>
                                </Tr>
                                <Tr>
                                    <Td>Revision</Td>
                                    <Td isNumeric>{identity.revision}</Td>
                                </Tr>
                                <Tr>
                                    <Td>Transactions</Td>
                                    <Td isNumeric>{identity.totalTxs}</Td>
                                </Tr>
                                <Tr>
                                    <Td>Transfers</Td>
                                    <Td isNumeric>{identity.totalTransfers}</Td>
                                </Tr>
                                <Tr>
                                    <Td>Documents</Td>
                                    <Td isNumeric>{identity.totalDocuments}</Td>
                                </Tr>
                                <Tr>
                                    <Td>Data contracts</Td>
                                    <Td isNumeric>{identity.totalDataContracts}</Td>
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
                                        <TransactionsList transactions={transactions.resultSet} size='m'/>
                                    </Box>
                                </TabPanel>

                                <TabPanel>
                                    <Box>
                                        <DocumentsList documents={documents.resultSet} size='m'/>
                                    </Box>

                                </TabPanel>

                                <TabPanel>
                                    <Box>
                                        <DataContractsList dataContracts={dataContracts.resultSet} size='m'/>
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
