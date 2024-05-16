'use client'

import { useState, useEffect } from 'react'
import * as Api from '../../../util/Api'
import TransactionsList from '../../../components/transactions/TransactionsList'
import { LoadingLine } from '../../../components/loading'

import {
  Container,
  TableContainer, Table, Thead, Tbody, Tr, Th, Td,
  Heading
} from '@chakra-ui/react'

function Block ({ hash }) {
  const [block, setBlock] = useState({ data: {}, loading: true, error: false })
  const txHashes = block.data?.txs || []
  const tdTitleWidth = 250

  const fetchData = () => {
    setBlock(state => ({ ...state, loading: true }))

    Api.getBlockByHash(hash)
      .then(res => setBlock({ data: res, loading: false, error: false }))
      .catch(err => {
        console.error(err)
        setBlock({ data: null, loading: true, error: true })
      })
  }

  useEffect(fetchData, [hash])

  return (
    <Container
        maxW='container.xl'
        bg='gray.600'
        color='white'
        _dark={{ bg: 'gray.900' }}
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
                        <Td w={tdTitleWidth}>Hash</Td>
                        <Td>
                          {!block.loading
                            ? !block.error
                                ? block.data.header.hash
                                : 'error'
                            : <LoadingLine/>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Height</Td>
                        <Td>
                          {!block.loading
                            ? !block.error
                                ? block.data.header.height
                                : 'error'
                            : <LoadingLine/>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Timestamp</Td>
                        <Td>
                          {!block.loading
                            ? !block.error
                                ? new Date(block.data.header.timestamp).toLocaleString()
                                : 'error'
                            : <LoadingLine/>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Block Version</Td>
                        <Td>
                          {!block.loading
                            ? !block.error
                                ? block.data.header.blockVersion
                                : 'error'
                            : <LoadingLine/>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>App Version</Td>
                        <Td>
                          {!block.loading
                            ? !block.error
                                ? block.data.header.appVersion
                                : 'error'
                            : <LoadingLine/>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>L1 Locked Height</Td>
                        <Td>
                          {!block.loading
                            ? !block.error
                                ? block.data.header.l1LockedHeight
                                : 'error'
                            : <LoadingLine/>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Transactions count</Td>
                        <Td>
                          {!block.loading
                            ? !block.error
                                ? txHashes.length
                                : 'error'
                            : <LoadingLine/>}
                        </Td>
                    </Tr>
                    <Tr>
                        <Td w={tdTitleWidth}>Validator</Td>
                        <Td>
                          {!block.loading
                            ? !block.error
                                ? block.data.header.validator
                                : 'error'
                            : <LoadingLine/>}
                        </Td>
                    </Tr>
                </Tbody>
            </Table>
        </TableContainer>

        {txHashes.length
          ? <Container
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
  )
}

export default Block
