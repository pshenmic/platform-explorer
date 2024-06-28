'use client'

import { useState, useEffect } from 'react'
import { fetchHandlerSuccess } from '../../../util'
import { LoadingLine } from '../../../components/loading'
import { ErrorMessageBlock } from '../../../components/Errors'
import BlocksList from '../../../components/blocks/BlocksList'
import {
  Container,
  TableContainer, Table, Thead, Tbody, Tr, Th, Td,
  Heading,
  Flex,
  Box
} from '@chakra-ui/react'
import ProposedBlocksChart from './ProposedBlocksChart'

function Validator ({ hash }) {
  const [validator, setValidator] = useState({ data: {}, loading: true, error: false })
  const tdTitleWidth = 250

  const fetchData = () => {
    fetchHandlerSuccess(setValidator, {})
  }

  useEffect(fetchData, [hash])

  return (
    <Container
        maxW={'container.xl'}
        p={3}
        mt={8}
    >
      <Flex
          w={'100%'}
          justifyContent={'space-between'}
          wrap={['wrap', 'wrap', 'wrap', 'nowrap']}
          mb={5}
      >
          <TableContainer
              width={['100%', '100%', '100%', 'calc(50% - 10px)']}
              maxW='none'
              borderWidth='1px' borderRadius='lg'
              m={0}
              flexShrink={0}
            >
              {!validator.error
                ? <Table variant='simple' className={'Table'}>
                      <Thead>
                          <Tr>
                              <Th pr={0}>validator info</Th>
                              <Th></Th>
                          </Tr>
                      </Thead>
                      <Tbody>
                          <Tr>
                              <Td w={tdTitleWidth}>TX Hash</Td>
                              <Td isNumeric>
                                  <LoadingLine loading={validator.loading}>{hash}</LoadingLine>
                              </Td>
                          </Tr>
                          <Tr>
                              <Td w={tdTitleWidth}>Status</Td>
                              <Td isNumeric>
                                  <LoadingLine loading={validator.loading}>active</LoadingLine>
                              </Td>
                          </Tr>
                      </Tbody>
                  </Table>
                : <Container h={60}><ErrorMessageBlock/></Container>}
          </TableContainer>

          <Box w={5} h={5} flexShrink={0}/>

          <ProposedBlocksChart/>
      </Flex>

      <Container
        width='100%'
        maxW='none'
        mt={5}
        borderWidth='1px' borderRadius='lg'
        className={'InfoBlock'}
      >
          <Heading className={'InfoBlock__Title'} as='h1' size='sm'>Proposed blocks</Heading>
          <BlocksList/>
      </Container>
    </Container>
  )
}

export default Validator
