'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import * as Api from '../../../util/Api'
import { fetchHandlerSuccess, fetchHandlerError } from '../../../util'
import { ErrorMessageBlock } from '../../../components/Errors'
import { LoadingLine, LoadingBlock } from '../../../components/loading'

import './Document.scss'

import {
  Box,
  Container,
  TableContainer, Table, Thead, Tbody, Tr, Th, Td,
  Heading,
  Flex,
  Code
} from '@chakra-ui/react'

function Document ({ identifier }) {
  const [document, setDocument] = useState({ data: {}, props: { printCount: 5 }, loading: true, error: false })
  const tdTitleWidth = 100

  const fetchData = () => {
    setDocument(state => ({ ...state, loading: true }))

    Api.getDocumentByIdentifier(identifier)
      .then(document => fetchHandlerSuccess(setDocument, document))
      .catch(err => fetchHandlerError(setDocument, err))
  }

  useEffect(fetchData, [identifier])

  return (
    <Container
        maxW={'container.xl'}
        bg={'gray.600'}
        color={'white'}
        _dark={{ bg: 'gray.900' }}
        mt={8}
        mb={8}
        className={'DocumentPage'}
    >
        <Flex
            w={'100%'}
            justifyContent={'space-between'}
            wrap={['wrap', 'wrap', 'wrap', 'nowrap']}
        >
            <TableContainer
                maxW={'none'}
                borderWidth={'1px'} borderRadius={'lg'}
                width={['100%', '100%', '100%', '50%']}
                m={0}
            >
                {!document.error
                  ? <Table variant={'simple'}>
                        <Thead>
                            <Tr>
                                <Th pr={0}>Document info</Th>
                                <Th></Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td w={tdTitleWidth}>Identifier</Td>
                                <Td>
                                    <LoadingLine loading={document.loading}>{document.data?.identifier}</LoadingLine>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td w={tdTitleWidth}>Owner</Td>
                                <Td>
                                    <LoadingLine loading={document.loading}>
                                        <Link href={`/identity/${document.data?.owner}`}>{document.data?.owner}</Link>
                                    </LoadingLine>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td w={tdTitleWidth}>System</Td>
                                <Td>
                                    <LoadingLine loading={document.loading}>{document.data?.isSystem ? 'true' : 'false'}</LoadingLine>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td w={tdTitleWidth}>Revision</Td>
                                <Td>
                                    <LoadingLine loading={document.loading}>{document.data?.revision}</LoadingLine>
                                </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                  : <ErrorMessageBlock/>}
            </TableContainer>

            <Box w={5} h={5} />

            <Container
                width={['100%', '100%', '100%', '50%']}
                maxW={'none'}
                className={'InfoBlock'}
                display={'flex'}
                flexDirection={'column'}
            >
                <Heading className={'InfoBlock__Title'} as={'h1'}>Data</Heading>
                  {!document.error
                    ? <LoadingBlock loading={document.loading}>
                        <Code
                            borderRadius={'lg'}
                            className={'DocumentPage__Code'}
                            w={'100%'}
                        >
                            {!document.loading && JSON.stringify(JSON.parse(document.data?.data), null, 2)}
                        </Code>
                      </LoadingBlock>
                    : <ErrorMessageBlock h={40}/>}
            </Container>
        </Flex>
    </Container>
  )
}

export default Document
