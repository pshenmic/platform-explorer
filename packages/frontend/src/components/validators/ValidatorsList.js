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

import { TableHeaders } from '../../components/ui/Table'

export default function ValidatorsList ({ validators }) {
  const [sort, setSort] = useState({ key: 'blocksProposed', direction: 'asc' })
  const [viewActive, setViewActive] = useState(true)
  const activeCount = validators.data?.resultSet?.length > 0 ? validators.data?.resultSet.filter((validator) => validator.active).length : 0
  const inactiveCount = validators.data?.resultSet?.length > 0 ? validators.data?.resultSet.filter((validator) => !validator.active).length : 0

  const ValidatorRow = ({ validator }) => {
    return (
      <Tr>
        <Td><Link href={'/validator/a1b2c3'}>{validator.protxhash}</Link></Td>
        <Td isNumeric>{validator.lastBlockHeight}</Td>
        <Td isNumeric>{validator.blocksProposed}</Td>
      </Tr>
    )
  }

  function getSortedList () {
    if (!validators?.data?.resultSet?.length) return []

    if (sort.direction === 'asc')
      return validators.data.resultSet.sort((a, b) => (a[sort.key] > b[sort.key] ? 1 : -1))
      
    return validators.data.resultSet.sort((a, b) => (a[sort.key] > b[sort.key] ? -1 : 1))
  }

  const headers = [
    {
      key: 'hash',
      label: 'proTxHash'
    },
    {
      key: 'lastBlockHeight',
      label: 'Last block height',
      isNumeric: true,
      sortable: true
    },
    {
      key: 'blocksProposed',
      label: 'Blocks proposed',
      isNumeric: true,
      sortable: true
    }
  ]

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
        <Table size={'md'} className={'Table'}>
          <Thead>
            <Tr>
              <TableHeaders headers={headers} sortCallback={setSort} />
            </Tr>
          </Thead>
          <Tbody>
            {!validators.loading
              ? getSortedList().map((validator, i) => (
                viewActive === validator.active &&
                  <ValidatorRow key={i} validator={validator}/>
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
