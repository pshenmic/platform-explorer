'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import * as Api from '../../../util/Api'
import ReactPaginate from 'react-paginate'
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

export async function loader(identifier) {
    const [dataContract, documents] = await Promise.all([
        Api.getDataContractByIdentifier(identifier),
        Api.getDocumentsByDataContract(identifier, 
                                       pagintationConfig.defaultPage, 
                                       pagintationConfig.itemsOnPage.default + 1)
    ])

    return {
        dataContract,
        documents
    }
}

function DataContract({identifier}) {
    const [dataContract, setDataContract] = useState({})
    const [documents, setDocuments] = useState([])
    const [pageCount, setPageCount] = useState(0)
    const [loading, setLoading] = useState(true)

    const fetchData = () => {
        setLoading(true)

        try {
            loader(identifier).then((res) => {

                setDataContract(res.dataContract)
                setDocuments(res.documents.resultSet)
                setPageCount(Math.ceil(res.documents.pagination.total / pagintationConfig.itemsOnPage.default))
                setLoading(false)

            })
        } catch (error) {
            console.log(error)
        }

    }

    useEffect(fetchData, [identifier])


    const handlePageClick = async ({selected}) => {

        Api.getDocumentsByDataContract(dataContract.identifier,
                                       selected  + 1, 
                                       pagintationConfig.itemsOnPage.default + 1)
            .then((res) => {
                setDocuments(res.resultSet)
            })
            
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
                            <Td>Created</Td>
                            <Td isNumeric>{new Date(dataContract.timestamp).toLocaleString()}</Td>
                        </Tr>
                        <Tr>
                            <Td>Revision</Td>
                            <Td isNumeric>{dataContract.version}</Td>
                        </Tr>
                        <Tr>
                            <Td>Transaction</Td>
                            <Td isNumeric>
                                <Link href={`/transaction/${dataContract.txHash}`}>{dataContract.txHash}</Link>
                            </Td>
                        </Tr>

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
                                <ReactPaginate
                                    breakLabel="..."
                                    nextLabel=">"
                                    onPageChange={handlePageClick}
                                    pageRangeDisplayed={2}
                                    marginPagesDisplayed={1}
                                    pageCount={pageCount}
                                    previousLabel="<"
                                    pageClassName="page-item"
                                    pageLinkClassName="page-link"
                                    previousClassName="page-item page-item--previous"
                                    previousLinkClassName="page-link"
                                    nextClassName="page-item page-item--next"
                                    nextLinkClassName="page-link"
                                    breakClassName="page-item  page-item--break-link"
                                    containerClassName="pagination"
                                    activeClassName="active"
                                    renderOnZeroPageCount={false}
                                />
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
                                        {JSON.stringify(dataContract.schema, null, 2)}
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
