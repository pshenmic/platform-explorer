import React from 'react'
import { useLoaderData} from 'react-router-dom'
import * as Api from '../../util/Api'
import TransactionsList from '../../components/transactions/TransactionsList'

import { 
    Container,
    TableContainer, Table, Thead, Tbody, Tr, Th, Td, 
    Heading, 
} from '@chakra-ui/react'


export async function loader({params}) {
    const {hash} = params
    const block = await Api.getBlockByHash(hash);
    return {block};
}

function BlockRoute() {
    const {block} = useLoaderData();

    const txHashes = block?.txs || [];

    return (
        <Container 
            maxW='container.xl' 
            bg='gray.600' 
            color='white'
            _dark={{ bg: "gray.900" }}
            mt={8}
        >

            <TableContainer 
                maxW='none'
                borderWidth='1px' borderRadius='lg'
            >
                <Table variant='simple'>
                    <Thead>
                        <Tr>
                            <Th><div className={'Table__Title'}>Block info</div></Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>Hash</Td>
                            <Td>{block.header.hash}</Td>
                        </Tr>
                        <Tr>
                            <Td>Height</Td>
                            <Td>{block.header.height}</Td>
                        </Tr>
                        <Tr>
                            <Td>Timestamp</Td>
                            <Td>{new Date(block.header.timestamp).toLocaleString()}</Td>
                        </Tr>
                        <Tr>
                            <Td>Block Version</Td>
                            <Td>{block.header.blockVersion}</Td>
                        </Tr>
                        <Tr>
                            <Td>App Version</Td>
                            <Td>{block.header.appVersion}</Td>
                        </Tr>
                        <Tr>
                            <Td>L1 Locked Height</Td>
                            <Td>{block.header.l1LockedHeight}</Td>
                        </Tr>
                        <Tr>
                            <Td>Transactions count</Td>
                            <Td>{txHashes.length}</Td>
                        </Tr>

                    </Tbody>
                </Table>
            </TableContainer>


            {txHashes.length ?  
                <Container 
                    width='100%'
                    maxW='none'
                    mt={5}
                    borderWidth='1px' borderRadius='lg'
                    className={'InfoBlock'}
                >

                    <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Transactions</Heading>

                    <div>

                        <TransactionsList transactions={txHashes}/>

                    </div> 
                </Container>
           : null}

        </Container>
    );
}

export default BlockRoute;
