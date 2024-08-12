'use client'

import * as Api from '../../../util/Api'
import { useState, useEffect, useCallback } from 'react'
import { getTransitionTypeString, fetchHandlerSuccess, fetchHandlerError, numberFormat } from '../../../util'
import { LoadingLine, LoadingList } from '../../../components/loading'
import { ErrorMessageBlock } from '../../../components/Errors'
import TransactionData from './TransactionData'
import { CheckCircleIcon, WarningTwoIcon } from '@chakra-ui/icons'
import './Transaction.scss'

import {
  Container,
  TableContainer, Table, Thead, Tbody, Tr, Th, Td,
  Heading,
  Flex
} from '@chakra-ui/react'

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
    setTransaction(state => ({ ...state, loading: true }))

    Api.getTransaction(hash)
      .then((res) => {
        fetchHandlerSuccess(setTransaction, res)
        decodeTx(res.data)
      })
      .catch(err => fetchHandlerError(setTransaction, err))
  }

  useEffect(fetchData, [hash, decodeTx])

  const StatusIcon = transaction.data.status === 'SUCCESS'
    ? <CheckCircleIcon color={'green.500'} ml={2}/>
    : <WarningTwoIcon color={'red.500'} ml={2}/>

  return (
    <Container
        maxW={'container.lg'}
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
                        <Td w={tdTitleWidth}>Status</Td>
                        <Td>
                            <LoadingLine loading={transaction.loading}><Flex alignItems={'center'}>{transaction.data?.status}{StatusIcon}</Flex></LoadingLine>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Hash</Td>
                        <Td>
                            <LoadingLine loading={transaction.loading}>{transaction.data?.hash}</LoadingLine>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Height</Td>
                        <Td>
                            <LoadingLine loading={transaction.loading}>{transaction.data?.blockHeight}</LoadingLine>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Type</Td>
                        <Td>
                            <LoadingLine loading={transaction.loading}>
                                {transaction.data?.type && getTransitionTypeString(transaction.data?.type)}
                            </LoadingLine>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Index</Td>
                        <Td>
                            <LoadingLine loading={transaction.loading}>{transaction.data?.index}</LoadingLine>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Timestamp</Td>
                        <Td>
                            <LoadingLine loading={transaction.loading}>{transaction.data?.timestamp && new Date(transaction.data?.timestamp).toLocaleString()}</LoadingLine>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Gas Used</Td>
                        <Td>
                            <LoadingLine loading={transaction.loading}>{numberFormat(transaction.data?.gasUsed)}</LoadingLine>
                        </Td>
                    </Tr>
                </Tbody>
                </Table>
              : <Container h={20}><ErrorMessageBlock/></Container>}
        </TableContainer>

        {!transaction.error &&
          <Container
            maxW={'container.lg'}
            m={0}
            className={'InfoBlock'}
          >
            <Heading className={'InfoBlock__Title'} as={'h1'}>Transaction data</Heading>

            {(!transaction.loading && decodedST)
              ? <Table variant='simple' className='Table TransactionData'>
                    <TransactionData data={decodedST}/>
                </Table>
              : <LoadingList itemsCount={3}/>}
          </Container>
        }
    </Container>
  )
}

export default Transaction
