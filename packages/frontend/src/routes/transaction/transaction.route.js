import {useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './transaction.css'
import {useState} from "react";
import {getTransitionTypeString} from "../../util";

import { 
    Container,
    TableContainer, Table, Thead, Tbody, Tr, Th, Td
} from "@chakra-ui/react"


export async function loader({params}) {
    const {txHash} = params

    const transaction = await Api.getTransaction(txHash);

    return {transaction};
}

function TransactionRoute() {
    const {transaction} = useLoaderData();

    const decodeTx = (tx) => {
        if (decodedST) {
            return
        }
        setDecoding(true)
        setDecodingError(false)
        setDecodedST(null)

        Api.decodeTx(tx)
            .then((stateTransition) => {
                setDecoding(false)
                setDecodedST(stateTransition)
                console.log(stateTransition)
            })
            .catch((e) => {
                setDecodingError(e.message)
            })
            .finally(() => setDecoding(false))
    }

    const [decoding, setDecoding] = useState(false)
    const [decodingError, setDecodingError] = useState(null)
    const [decodedST, setDecodedST] = useState(null)

    return (
        <Container 
            maxW='container.xl' 
            p={3}
            mt={8}
        >
            <TableContainer 
                maxW='none'
                borderWidth='1px' borderRadius='lg'
            >
                <Table variant='simple'>
                    <Thead>
                        <Tr>
                            <Th>transaction info</Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>Hash</Td>
                            <Td >{transaction.hash}</Td>
                        </Tr>
                        <Tr>
                            <Td>Height</Td>
                            <Td >{transaction.blockHeight}</Td>
                        </Tr>
                        <Tr>
                            <Td>Index</Td>
                            <Td >{transaction.index}</Td>
                        </Tr>
                        <Tr>
                            <Td>Type</Td>
                            <Td >{getTransitionTypeString(transaction.type)}</Td>
                        </Tr>
                        <Tr>
                            <Td>Timestamp</Td>
                            <Td >{transaction.timestamp}</Td>
                        </Tr>

                    </Tbody>
                </Table>
            </TableContainer>
        </Container>
    );
}

export default TransactionRoute;
