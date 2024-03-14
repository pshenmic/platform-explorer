'use client'

import { useState, useEffect } from 'react'
import * as Api from "../../../util/Api";
import Link from 'next/link'
import TransactionsList from "../../../components/transactions/TransactionsList";
import DocumentsList from "../../../components/documents/DocumentsList";
import DataContractsList from "../../../components/dataContracts/DataContractsList";
import TransfersList from "../../../components/transfers/TransfersList";
import './Identity.scss'

import { 
    Box, 
    Container,
    TableContainer, Table, Thead, Tbody, Tr, Th, Td,
    Tabs, TabList, TabPanels, Tab, TabPanel,
    Flex, 
} from "@chakra-ui/react"


export async function loader(identifier) {
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
    }
}

function Identity({identifier}) {
    const [identity, setIdentity] = useState({})
    const [dataContracts, setDataContracts] = useState([])
    const [documents, setDocuments] = useState([])
    const [transactions, setTransactions] = useState([])
    const [transfers, setTransfers] = useState([])
    const [loading, setLoading] = useState(true)


    const fetchData = () => {
        setLoading(true)

        loader(identifier).then((res) => {
            
            setIdentity(res.identity)
            setDataContracts(res.dataContracts)
            setDocuments(res.documents)
            setTransactions(res.transactions)
            setTransfers(res.transfers)

        }).catch((error) => {

            console.log(error)

        }).finally(() => {

            setLoading(false)
            
        })
    }

    useEffect(fetchData, [identifier])


    if (!loading) return (
        <div className={'identity'}>
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
                        width={["100%", , , "calc(50% - 10px)"]}
                        maxW='none'
                        borderWidth='1px' borderRadius='lg'
                        m={0}
                        className={'IdentityInfo'}
                    >
                        <Table variant='simple' className={'Table'}>
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
                                        <Link href={`/transaction/${identity.txHash}`}>
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
                        width={["100%", , ,"calc(50% - 10px)"]}
                        maxW='none'
                        m={0}
                        borderWidth='1px' borderRadius='lg'
                        className={'InfoBlock'}
                    >
                        <Tabs className={'IdentityData'}>
                            <TabList className={'IdentityData__Tabs'}>
                                <Tab className={'IdentityData__Tab'}>Transactions</Tab>
                                <Tab className={'IdentityData__Tab'}>Transfers</Tab>
                                <Tab className={'IdentityData__Tab'}>Documents</Tab>
                                <Tab className={'IdentityData__Tab'}>Data contracts</Tab>
                            </TabList>

                            <TabPanels>

                                <TabPanel px={0}>
                                    <Box>
                                        <TransactionsList transactions={transactions.resultSet} size='m'/>
                                    </Box>
                                </TabPanel>

                                <TabPanel px={0}>
                                    <Box>
                                        <TransfersList transfers={transfers.resultSet} identityId={identity.identifier}/>
                                    </Box>
                                </TabPanel>

                                <TabPanel px={0}>
                                    <Box>
                                        <DocumentsList documents={documents.resultSet} size='m'/>
                                    </Box>
                                </TabPanel>

                                <TabPanel px={0}>
                                    <Box>
                                        <DataContractsList dataContracts={dataContracts.resultSet} size='m'/>
                                    </Box>
                                </TabPanel>

                            </TabPanels>
                        </Tabs>
                    </Container>
                </Flex>
            </Container>
        </div>
    )
}

export default Identity
