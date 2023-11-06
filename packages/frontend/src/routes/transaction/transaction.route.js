import * as Api from '../../util/Api'
import {Link, useLoaderData} from 'react-router-dom'
import {useState, useEffect} from 'react'
import {getTransitionTypeString} from '../../util'
import {StateTransitionEnum} from "../enums/state.transition.type"
import './transaction.scss'

import { 
    Container,
    TableContainer, Table, Thead, Tbody, Tr, Th, Td,
    Heading
} from '@chakra-ui/react'


export async function loader({params}) {
    const { txHash } = params

    const transaction = await Api.getTransaction(txHash)

    return { transaction }
}

function TransactionData({data}) {
    if (data === null) return <></>

    if (data.type === StateTransitionEnum['DATA_CONTRACT_CREATE']) {
        return (<>
            <Thead>
                <Tr>
                    <Th>Created data contract</Th>
                    <Th></Th>
                </Tr>
            </Thead>

            <Tbody>
                <Tr>
                    <Td>Data contract</Td>
                    <Td><Link to={`/dataContract/${data.dataContractId}`}>{data.dataContractId}</Link></Td>
                </Tr>
                <Tr>
                    <Td>Created by</Td>
                    <Td><Link to={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>
                </Tr>
            </Tbody>
        </>)
    }

    if (data.type === StateTransitionEnum['DOCUMENTS_BATCH']) {
        return (<>
            <Thead>
                <Tr>
                    <Th>Changed documents</Th>
                    <Th></Th>
                </Tr>
            </Thead>

            {data.transitions.map((transition, key) => 
                <Tbody className='TransactionData__DocumentsBatch' key={'dc' + key}>
                    <Tr>
                        <Td>Data contract</Td>
                        <Td><Link to={`/dataContract/${transition.dataContractId}`}>{transition.dataContractId}</Link></Td>
                    </Tr>
                    <Tr>
                        <Td>Document</Td>
                        <Td><Link to={`/document/${transition.id}`}>{transition.id}</Link></Td>
                    </Tr>
                </Tbody>
            )}
        </>)
    }

    if (data.type === StateTransitionEnum['IDENTITY_CREATE']) {
        return (<>
            <Thead>
                <Tr>
                    <Th>Created identity</Th>
                    <Th></Th>
                </Tr>
            </Thead>

            <Tbody>
                <Tr>
                    <Td>Identity</Td>
                    <Td><Link to={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>
                </Tr>
            </Tbody>
        </>)
    }

    if (data.type === StateTransitionEnum['IDENTITY_TOP_UP']) {
        return (<>
            <Thead>
                <Tr>
                    <Th>Credit top up</Th>
                    <Th></Th>
                </Tr>
            </Thead>

            <Tbody>
                <Tr>
                    <Td>Amount</Td>
                    <Td>{data.amount} Credits</Td>
                </Tr>
                <Tr>
                    <Td>Identity</Td>
                    <Td><Link to={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>
                </Tr>
            </Tbody>
        </>)
    }

    if (data.type === StateTransitionEnum['DATA_CONTRACT_UPDATE']) {
        return (<>
            <Thead>
                <Tr>
                    <Th>Updated data contract</Th>
                    <Th></Th>
                </Tr>
            </Thead>
            
            <Tbody>
                <Tr>
                    <Td>Data contract</Td>
                    <Td><Link to={`/dataContract/${data.dataContractId}`}>{data.dataContractId}</Link></Td>
                </Tr>
                <Tr>
                    <Td>Owner</Td>
                    <Td><Link to={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>
                </Tr>
                <Tr>
                    <Td>Version</Td>
                    <Td>{data.version}</Td>
                </Tr>
            </Tbody>
        </>)
    }

    if (data.type === StateTransitionEnum['IDENTITY_UPDATE']) {
        return (<>
            <Thead>
                <Tr>
                    <Th>Updated identity</Th>
                    <Th></Th>
                </Tr>
            </Thead>

            <Tbody>
                <Tr>
                    <Td>Identity</Td>
                    <Td><Link to={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>
                </Tr>
                <Tr>
                    <Td>Revision</Td>
                    <Td>{data.revision}</Td>
                </Tr>
            </Tbody>
        </>)
    }

    if (data.type === StateTransitionEnum['IDENTITY_CREDIT_WITHDRAWAL']) {
        return (<>
            <Thead>
                <Tr>
                    <Th>Credit withdrawal</Th>
                    <Th></Th>
                </Tr>
            </Thead>

            <Tbody>
                <Tr>
                    <Td>Amount</Td>
                    <Td>{data.amount} Credits</Td>
                </Tr>
                <Tr>
                    <Td>Identity</Td>
                    <Td><Link to={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>
                </Tr>
            </Tbody>
        </>)
    }

    if (data.type === StateTransitionEnum['IDENTITY_CREDIT_TRANSFER']) {
        return (<>
            <Thead>
                <Tr>
                    <Th>Credit transfer</Th>
                    <Th></Th>
                </Tr>
            </Thead>

            <Tbody>
                <Tr>
                    <Td>Amount</Td>
                    <Td>{data.amount} Credits</Td>
                </Tr>
                <Tr>
                    <Td>Sender</Td>
                    <Td><Link to={`/identity/${data.senderId}`}>{data.senderId}</Link></Td>
                </Tr>
                <Tr>
                    <Td>Recipient</Td>
                    <Td><Link to={`/identity/${data.recipientId}`}>{data.recipientId}</Link></Td>
                </Tr>
            </Tbody>
        </>)
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
        decodeTx(data)
    }, [])

    return (
        <Container 
            maxW='container.lg' 
            p={3}
            mt={8}
        >
            <TableContainer 
                maxW='none'
                borderWidth='1px' borderRadius='lg'
                mb={4}
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
                </Table>
            </TableContainer>

            <Container
                maxW='container.lg'
                m={0}
                borderWidth='1px' borderRadius='lg'
                className={'InfoBlock'}
            >
                <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Transaction data</Heading>


                <Table variant='simple' className='Table TransactionData'>

                    <TransactionData data={decodedST}/>

                </Table>
            </Container>
        </Container>
    )
}

export default TransactionRoute
