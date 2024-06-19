'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Switcher } from '../../components/ui'
import {
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react'

export default function ValidatorsList ({ validators }) {
  const [viewActive, setViewActive] = useState(true)
  const activeCount = validators.data?.resultSet?.length > 0 ? validators.data?.resultSet.filter((validator) => validator.active).length : 0
  const inactiveCount = validators.data?.resultSet?.length > 0 ? validators.data?.resultSet.filter((validator) => !validator.active).length : 0

  const ValidatorRow = ({ validator }) => {
    return (
      <Tr>
        <Td><Link href={'/validator/a1b2c3'}>{validator.protxhash}</Link></Td>
        <Td isNumeric>{validator.lastBlockHeight}</Td>
        <Td isNumeric>{validator.BlocksProposed}</Td>
      </Tr>
    )
  }

  return (
    <div className={'ValidatorsList'}>
      <Switcher
        options={[
          {
            title: 'Active'
          },
          {
            title: 'Inactive'
          }
        ]}
        onChange={e => setViewActive(e === 'Active')}
      />

      <TableContainer>
        <Table size='md' className='Table'>
          <Thead>
            <Tr>
              <Th>proTxHash</Th>
              <Th isNumeric>Last block height</Th>
              <Th isNumeric>Blocks proposed</Th>
            </Tr>
          </Thead>
          <Tbody>
            {!validators.loading
              ? validators.data.resultSet.map((validator, i) => (
                viewActive === validator.active &&
                  <ValidatorRow key={i} validator={{
                    protxhash: 'f92e66edc9c8da41de71073ef08d62c56f8752a3f4e29ced6c515e0b1c074a38',
                    lastBlockHeight: '13619',
                    BlocksProposed: '1024'
                  }}/>
              ))
              : <>loading</>
            }
          </Tbody>
        </Table>
      </TableContainer>

      {(!viewActive && !inactiveCount) &&
        <Flex justifyContent={'center'} alignItems={'center'} height={'100px'}>
          All validators is active
        </Flex>
      }

      {(viewActive && !activeCount) &&
        <Flex justifyContent={'center'} alignItems={'center'} height={'100px'}>
          All validators is inactive
        </Flex>
      }
    </div>
  )
}
