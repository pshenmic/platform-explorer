import * as Api from '../../util/Api'
import {Link, useLoaderData} from 'react-router-dom'
import {useState, useEffect} from 'react'
import {getTransitionTypeString} from '../../util'
import './transaction.css'

import { 
    Container,
    TableContainer, Table, Thead, Tbody, Tr, Th, Td,
} from '@chakra-ui/react'


export async function loader({params}) {
    const { txHash } = params

    const transaction = await Api.getTransaction(txHash)

    return { transaction }
}

function TransactionData({data}) {
    if (data === null) return <></>

    if (data.type === 1) {
        return (<>
            {data.transitions.map((transition, key) => <Tbody key={'dc' + key}>
                <Tr>
                    <Td>Data contract</Td>
                    <Td><Link to={`/dataContract/${transition.dataContractId}`}>{transition.dataContractId}</Link></Td>
                </Tr>
                <Tr>
                    <Td>Document</Td>
                    <Td><Link to={`/document/${transition.id}`}>{transition.id}</Link></Td>
                </Tr>
            </Tbody>)}
        </>)
    }

    if (data.type === 2 || data.type === 5) {
        return (
            <Tbody>
                <Tr>
                    <Td>Identity</Td>
                    <Td><Link to={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>
                </Tr>
            </Tbody>
        )
    }

    if (data.type === 3) {
        return (
            <Tbody>
                <Tr>
                    <Td>Identity</Td>
                    <Td><Link to={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>
                </Tr>

                <Tr>
                    <Td>Amount</Td>
                    <Td>{data.amount} Credits</Td>
                </Tr>
            </Tbody>
        )
    }

    if (data.type === 0 || data.type === 4) {
        return (
            <Tbody>
                <Tr>
                    <Td>Data contract</Td>
                    <Td><Link to={`/dataContract/${data.dataContractId}`}>{data.dataContractId}</Link></Td>
                </Tr>

                <Tr>
                    <Td>Updated by</Td>
                    <Td><Link to={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>
                </Tr>
            </Tbody>
        )
    }

    if (data.type === 6) {
        return (<></>)
    }

    if (data.type === 7) {
        return (
            <Tbody>
                <Tr>
                    <Td>Sender</Td>
                    <Td><Link to={`/identity/${data.senderId}`}>{data.senderId}</Link></Td>
                </Tr>
                <Tr>
                    <Td>Recipient</Td>
                    <Td><Link to={`/identity/${data.recipientId}`}>{data.recipientId}</Link></Td>
                </Tr>
                <Tr>
                <Td>Amount</Td>
                    <Td>{data.amount} Credits</Td>
                </Tr>
            </Tbody>
        )
    }
}

function TransactionRoute() {
    const { transaction } = useLoaderData()

    const { hash, blockHeight, index, type, timestamp, data } = transaction

    const decodeTx = (tx) => {
        if (decodedST || decoding) {
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

    useEffect(() => {
        console.log('data')
        console.log(data)
        decodeTx(data)
    }, [])

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
                <Table variant='simple' className='Table'>
                    <Thead>
                        <Tr>
                            <Th>transaction info</Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>Hash</Td>
                            <Td>{hash}</Td>
                        </Tr>
                        <Tr>
                            <Td>Height</Td>
                            <Td>{blockHeight}</Td>
                        </Tr>
                        <Tr>
                            <Td>Index</Td>
                            <Td>{index}</Td>
                        </Tr>
                        <Tr>
                            <Td>Type</Td>
                            <Td>{getTransitionTypeString(type)}</Td>
                        </Tr>
                        <Tr>
                            <Td>Timestamp</Td>
                            <Td>{new Date(timestamp).toLocaleString()}</Td>
                        </Tr>

                    </Tbody>

                    <TransactionData data={decodedST}/>

                </Table>
            </TableContainer>
        </Container>
    )
}

export default TransactionRoute
