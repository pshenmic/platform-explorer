'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import * as Api from '../../../util/Api'
import Pagination from '../../../components/pagination'
import DocumentsList from '../../../components/documents/DocumentsList'
import './DataContract.scss'

import {
    Box, 
    Container,
    TableContainer, Table, Thead, Tbody, Tfoot, Tr, Th, Td,
    Tabs, TabList, TabPanels, Tab, TabPanel,
    Code 
} from '@chakra-ui/react'


const pagintationConfig = {
    itemsOnPage: {
        default: 25,
        values: [10, 25, 50, 75, 100]
    },
    defaultPage: 1
}


function DataContract({identifier}) {
    const [dataContract, setDataContract] = useState({})
    const [documents, setDocuments] = useState([])
    const pageSize = pagintationConfig.itemsOnPage.default
    const [total, setTotal] = useState(1)
    const [currentPage, setCurrentPage] = useState(0)
    const pageCount = Math.ceil(total / pageSize)
    const [loading, setLoading] = useState(true)

    const fetchData = () => {
        setLoading(true)

        Promise.all([
            Api.getDataContractByIdentifier(identifier),
            Api.getDocumentsByDataContract(identifier, 
                                           pagintationConfig.defaultPage, 
                                           pagintationConfig.itemsOnPage.default + 1)
        ])
        .then(([defaultDataContract, defaultDocuments]) => {
            setDataContract(defaultDataContract)
            setDocuments(defaultDocuments.resultSet)
            setTotal(defaultDocuments.pagination.total)
        })            
        .catch(console.log)
        .finally(() => {
            setLoading(false)
        })
    }

    useEffect(fetchData, [identifier])

    const handlePageClick = ({selected}) => {
        Api.getDocumentsByDataContract(dataContract.identifier,
                                       selected  + 1, 
                                       pagintationConfig.itemsOnPage.default + 1)
            .then((res) => setDocuments(res.resultSet))

        setCurrentPage(selected)
    }

    if (!loading) return (
        <Container 
            maxW='container.xl' 
            padding={3}
            mt={8}
            className={'DataContract'}
        >
            <TableContainer 
                maxW='none'
                borderWidth='1px' borderRadius='lg'
            >
                <Table variant='simple'>
                    <Thead>
                        <Tr>
                            <Th>Data contract info</Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>Identifier</Td>
                            <Td isNumeric>{dataContract.identifier}</Td>
                        </Tr>
                        <Tr>
                            <Td>Owner</Td>
                            <Td isNumeric>
                                <Link href={`/identity/${dataContract.owner}`}>{dataContract.owner}</Link>
                            </Td>
                        </Tr>

                        <Tr>
                            <Td>System</Td>
                            <Td isNumeric>{dataContract.isSystem ? 'true': 'false'}</Td>
                        </Tr>

                        {!dataContract.isSystem && 
                            <Tr>
                                <Td>Created</Td>
                                <Td isNumeric>{new Date(dataContract.timestamp).toLocaleString()}</Td>
                            </Tr>
                        }

                        <Tr>
                            <Td>Documents Count</Td>
                            <Td isNumeric>{dataContract.documentsCount}</Td>
                        </Tr>

                        <Tr>
                            <Td>Revision</Td>
                            <Td isNumeric>{dataContract.version}</Td>
                        </Tr>

                        {!dataContract.isSystem && 
                            <Tr>
                                <Td>Transaction</Td>
                                <Td isNumeric>
                                    <Link href={`/transaction/${dataContract.txHash}`}>{dataContract.txHash}</Link>
                                </Td>
                            </Tr>
                        }
                    </Tbody>
                </Table>
            </TableContainer>

            <Container 
                width='100%'
                maxW='none'
                mt={5}
                borderWidth='1px' borderRadius='lg'
                className={'InfoBlock'}
            >
                <Tabs>
                    <TabList>
                        <Tab>Documents</Tab>
                        <Tab>Schema</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <Box>
                                <Box m={4}>
                                    <DocumentsList 
                                        documents={documents}
                                        columnsCount={2}
                                    />
                                </Box>
                                
                                <div className={'ListNavigation'}>
                                    {pageCount > 1 && 
                                        <Pagination
                                            onPageChange={handlePageClick}
                                            pageCount={pageCount}
                                            forcePage={currentPage}
                                        />
                                    }
                                </div>
                            </Box>
                        </TabPanel>

                        <TabPanel>
                            <Box>
                                <div className={'DataContractSchema'}>
                                    <Code 
                                        className={'DataContractSchema__Code'}
                                        borderRadius='lg'
                                        p={4}
                                        w='100%'
                                    >
                                        {JSON.stringify(JSON.parse(dataContract.schema), null, 2)}
                                    </Code>
                                </div>
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Container>
        </Container>
    )
}

export default DataContract;
