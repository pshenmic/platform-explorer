import React from 'react';
import {useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './document.scss'

import { 
    Box, 
    Container,
    TableContainer, Table, Thead, Tbody, Tr, Th, Td,
    Heading, 
    Flex,
    Code 
} from "@chakra-ui/react";

export async function loader({params}) {
    const {identifier} = params

    return await Api.getDocumentByIdentifier(identifier);
}

function DocumentRoute() {
    const document = useLoaderData()

    return (
        <Container 
            maxW='container.xl' 
            bg='gray.600' 
            color='white'
            _dark={{ bg: "gray.900" }}
            mt={8}
            mb={8}
            className='DocumentPage'
        >
            <Flex 
                w='100%' 
                justifyContent='space-between'
                wrap={["wrap", , , 'nowrap']}
            >

                <TableContainer 
                    maxW='none'
                    borderWidth='1px' borderRadius='lg'
                    width={["100%", , , "50%"]}
                    m={0}
                >
                    <Table variant='simple'>
                        <Thead>
                            <Tr>
                                <Th>Document info</Th>
                                <Th></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td>Identifier</Td>
                                <Td isNumeric>{document.identifier}</Td>
                            </Tr>
                            <Tr>
                                <Td>Revision</Td>
                                <Td isNumeric>{document.revision}</Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </TableContainer>

                <Box w={5} h={5} />
            
                <Container 
                    width={["100%", , ,"50%"]}
                    maxW='none'
                    borderWidth='1px' borderRadius='lg'
                    className='InfoBlock'
                >
                    <Heading className='InfoBlock__Title' as='h1' size='sm'>Data</Heading>

                    <Code 
                        borderRadius='lg'
                        className='DocumentPage__Code'
                        w='100%'
                    >
                        {JSON.stringify(document.data, null, 2)}
                    </Code>   

                </Container>
            </Flex>
        </Container>
    );
}

export default DocumentRoute;
