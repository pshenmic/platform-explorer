'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import TransactionsList from '../../../components/transactions/TransactionsList'
import { LoadingLine } from '../../../components/loading'
import { ErrorMessageBlock } from '../../../components/Errors'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'

import {
  Container,
  TableContainer, Table, Thead, Tbody, Tr, Th, Td,
  Heading
} from '@chakra-ui/react'

function Block ({ hash }) {
  const [block, setBlock] = useState({ data: {}, loading: true, error: false })
  const [rate, setRate] = useState({ data: {}, loading: true, error: false })
  const tdTitleWidth = 250

  const fetchData = () => {
    setBlock(state => ({ ...state, loading: true }))

    Api.getBlockByHash(hash)
      .then(res => fetchHandlerSuccess(setBlock, res))
      .catch(err => fetchHandlerError(setBlock, err))

    Api.getRate()
      .then(res => fetchHandlerSuccess(setRate, res))
      .catch(err => fetchHandlerError(setRate, err))
  }

  useEffect(fetchData, [hash])

  return (
    <Container
        maxW={'container.xl'}
        bg={'gray.600'}
        color={'white'}
        _dark={{ bg: 'gray.900' }}
        mt={8}
    >
        <TableContainer
            maxW={'none'}
            borderWidth={'1px'} borderRadius={'block'}
        >
            {!block.error
              ? <Table variant={'simple'}>
                <Thead>
                    <Tr>
                        <Th><div className={'Table__Title'}>Block info</div></Th>
                        <Th></Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td w={tdTitleWidth}>Hash</Td>
                        <Td className={'Table__Cell--BreakWord Table__Cell--Mono'}>
                          <LoadingLine loading={block.loading}>
                            {block.data?.header?.hash}
                          </LoadingLine>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Height</Td>
                        <Td>
                          <LoadingLine loading={block.loading}>{block.data?.header?.height}</LoadingLine>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Timestamp</Td>
                        <Td>
                          <LoadingLine loading={block.loading}>{new Date(block.data?.header?.timestamp).toLocaleString()}</LoadingLine>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Block Version</Td>
                        <Td>
                          <LoadingLine loading={block.loading}>{block.data?.header?.blockVersion}</LoadingLine>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>App Version</Td>
                        <Td>
                          <LoadingLine loading={block.loading}>{block.data?.header?.appVersion}</LoadingLine>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>L1 Locked Height</Td>
                        <Td>
                          <LoadingLine loading={block.loading}>{block.data?.header?.l1LockedHeight}</LoadingLine>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Transactions count</Td>
                        <Td>
                          <LoadingLine loading={block.loading}>{block.data?.txs?.length}</LoadingLine>
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Validator</Td>
                        <Td className={'Table__Cell--BreakWord Table__Cell--Mono'}>
                          <LoadingLine loading={block.loading}>
                            {block.data?.header?.validator}
                          </LoadingLine>
                        </Td>
                    </Tr>
                </Tbody>
              </Table>
              : <Container h={20}><ErrorMessageBlock/></Container>}
        </TableContainer>

        {block.data?.txs?.length
          ? <Container
              width={'100%'}
              maxW={'none'}
              mt={5}
              className={'InfoBlock'}
            >
              <Heading className={'InfoBlock__Title'} as={'h1'}>Transactions</Heading>
              <TransactionsList transactions={block.data?.txs} rate={rate.data}/>
            </Container>
          : null}
    </Container>
  )
}

export default Block
