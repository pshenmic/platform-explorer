'use client'

import * as Api from '../../../util/Api'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { getTransitionTypeString } from '../../../util'
import { StateTransitionEnum } from '../../enums/state.transition.type'
import { LoadingLine } from '../../../components/loading'
import { ErrorMessageBlock } from '../../../components/Errors'
import { ListLoadingPreview } from '../../../components/lists'
import './Transaction.scss'

import {
  Container,
  TableContainer, Table, Thead, Tbody, Tr, Th, Td,
  Heading
} from '@chakra-ui/react'

function TransactionData ({ data }) {
  if (data === null) return <></>

  if (data.type === StateTransitionEnum.DATA_CONTRACT_CREATE) {
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
                <Td><Link href={`/dataContract/${data.dataContractId}`}>{data.dataContractId}</Link></Td>
            </Tr>
            <Tr>
                <Td>Owner</Td>
                <Td><Link href={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>
            </Tr>
        </Tbody>
    </>)
  }

  if (data.type === StateTransitionEnum.DOCUMENTS_BATCH) {
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
                    <Td><Link href={`/dataContract/${transition.dataContractId}`}>{transition.dataContractId}</Link></Td>
                </Tr>
                <Tr>
                    <Td>Document</Td>
                    <Td><Link href={`/document/${transition.id}`}>{transition.id}</Link></Td>
                </Tr>
            </Tbody>
        )}
    </>)
  }

  if (data.type === StateTransitionEnum.IDENTITY_CREATE) {
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
                <Td><Link href={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>
            </Tr>
        </Tbody>
    </>)
  }

  if (data.type === StateTransitionEnum.IDENTITY_TOP_UP) {
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
                <Td><Link href={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>
            </Tr>
        </Tbody>
    </>)
  }

  if (data.type === StateTransitionEnum.DATA_CONTRACT_UPDATE) {
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
                <Td><Link href={`/dataContract/${data.dataContractId}`}>{data.dataContractId}</Link></Td>
            </Tr>
            <Tr>
                <Td>Owner</Td>
                <Td><Link href={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>
            </Tr>
            <Tr>
                <Td>Version</Td>
                <Td>{data.version}</Td>
            </Tr>
        </Tbody>
    </>)
  }

  if (data.type === StateTransitionEnum.IDENTITY_UPDATE) {
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
                <Td><Link href={`/identity/${data.identityId}`}>{data.identityId}</Link></Td>
            </Tr>
            <Tr>
                <Td>Revision</Td>
                <Td>{data.revision}</Td>
            </Tr>
        </Tbody>
    </>)
  }

  if (data.type === StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL) {
    return (<>
        <Thead>
            <Tr>
                <Th>Credit withdrawal</Th>
                <Th></Th>
            </Tr>
        </Thead>

        <Tbody>
            <Tr>
                <Td>Identity</Td>
                <Td><Link href={`/identity/${data.senderId}`}>{data.senderId}</Link></Td>
            </Tr>
            <Tr>
                <Td>Output script</Td>
                <Td>{data.outputScript}</Td>
            </Tr>
            <Tr>
                <Td>Amount</Td>
                <Td>{data.amount} Credits</Td>
            </Tr>
            <Tr>
                <Td>Core fee per byte</Td>
                <Td>{data.coreFeePerByte}</Td>
            </Tr>
            <Tr>
                <Td>Nonce</Td>
                <Td>{data.nonce}</Td>
            </Tr>
        </Tbody>
    </>)
  }

  if (data.type === StateTransitionEnum.IDENTITY_CREDIT_TRANSFER) {
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
                <Td><Link href={`/identity/${data.senderId}`}>{data.senderId}</Link></Td>
            </Tr>
            <Tr>
                <Td>Recipient</Td>
                <Td><Link href={`/identity/${data.recipientId}`}>{data.recipientId}</Link></Td>
            </Tr>
        </Tbody>
    </>)
  }
}

function Transaction ({ hash }) {
  const [transaction, setTransaction] = useState({ data: {}, loading: true, error: false })
  const [decodedST, setDecodedST] = useState(null)
  const tdTitleWidth = 250

  const decodeTx = useCallback((tx) => {
    Api.decodeTx(tx)
      .then((stateTransition) => {
        setDecodedST(stateTransition)
      })
      .catch(console.log)
  }, [])

  const fetchData = () => {
    console.log('fetch')

    setTransaction(state => ({ ...state, loading: true }))

    Api.getTransaction(hash)
      .then((res) => {
        setTransaction({ data: res, loading: false, error: false })
        decodeTx(res.data)
      })
      .catch(err => {
        console.error(err)
        setTransaction({ data: null, loading: false, error: true })
      })
  }

  useEffect(fetchData, [hash, decodeTx])

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
            {!transaction.error
              ? <Table variant='simple' className='Table'>
                <Thead>
                    <Tr>
                        <Th>transaction info</Th>
                        <Th></Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td w={tdTitleWidth}>Hash</Td>
                        <Td>
                            {!transaction.loading
                              ? transaction.data.hash
                              : <LoadingLine/>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Height</Td>
                        <Td>
                            {!transaction.loading
                              ? transaction.data.blockHeight
                              : <LoadingLine/>}
                            </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Index</Td>
                        <Td>
                            {!transaction.loading
                              ? transaction.data.index
                              : <LoadingLine/>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Type</Td>
                        <Td>
                            {!transaction.loading
                              ? getTransitionTypeString(transaction.data.type)
                              : <LoadingLine/>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Timestamp</Td>
                        <Td>
                            {!transaction.loading
                              ? new Date(transaction.data.timestamp).toLocaleString()
                              : <LoadingLine/>}
                        </Td>
                    </Tr>
                </Tbody>
                </Table>
              : <Container h={20}><ErrorMessageBlock/></Container>}
        </TableContainer>
        
        {!transaction.error &&
          <Container
            maxW='container.lg'
            m={0}
            borderWidth='1px' borderRadius='lg'
            className={'InfoBlock'}
          >
            <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Transaction data</Heading>

            {(!transaction.loading && decodedST)
              ? <Table variant='simple' className='Table TransactionData'>
                    <TransactionData data={decodedST}/>
                </Table>
              : <ListLoadingPreview itemsCount={3}/>}
          </Container>
        }
    </Container>
  )
}

export default Transaction
