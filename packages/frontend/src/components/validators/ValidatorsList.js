'use client'

import { useState } from 'react'
import Link from 'next/link'
import ImageGenerator from '../imageGenerator'
import { LoadingLine } from '../../components/loading'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  TableContainer
} from '@chakra-ui/react'
import { TableHeaders } from '../../components/ui/Table'
import './ValidatorsList.scss'

export default function ValidatorsList ({ validators, pageSize }) {
  const [sort, setSort] = useState({ key: 'blocksProposed', direction: 'asc' })

  const ValidatorRow = ({ validator, loading }) => {
    return (
      <Tr className={'ValidatorTableRow'}>
        <Td>
          <LoadingLine loading={loading} w={'700px'} className={'ValidatorTableRow__IdentifierContainer'}>
            {!loading &&
              <Link href={`/validator/${validator.proTxHash}`} className={'ValidatorTableRow__IdentifierContainer'}>
                <ImageGenerator className={'ValidatorTableRow__Avatar'} username={validator.proTxHash} lightness={50} saturation={50} width={28} height={28} />
                <div className={'ValidatorTableRow__Identifier'}>{validator.proTxHash}</div>
              </Link>
            }
          </LoadingLine>
        </Td>
        <Td isNumeric><LoadingLine loading={loading}>{validator?.lastProposedBlockHeader?.height || '-'}</LoadingLine></Td>
        <Td isNumeric><LoadingLine loading={loading}>{validator?.proposedBlocksAmount || '-'}</LoadingLine></Td>
      </Tr>
    )
  }

  function getSortedList () {
    if (!validators?.data?.resultSet?.length) return []

    if (sort.direction === 'asc') {
      return validators.data.resultSet.sort((a, b) => {
        if (sort.key === 'lastBlockHeight') return (a?.lastProposedBlockHeader?.height || 0) > (b?.lastProposedBlockHeader?.height || 0) ? 1 : -1
        return a[sort.key] > b[sort.key] ? 1 : -1
      })
    }

    return validators.data.resultSet.sort((a, b) => {
      if (sort.key === 'lastBlockHeight') return (a?.lastProposedBlockHeader?.height || 0) > (b?.lastProposedBlockHeader?.height || 0) ? -1 : 1
      return a[sort.key] > b[sort.key] ? -1 : 1
    })
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
      key: 'proposedBlocksAmount',
      label: 'Blocks proposed',
      isNumeric: true,
      sortable: true
    }
  ]

  return (
    <div className={'ValidatorsList'}>
      <TableContainer>
        <Table size={'md'} className={'Table'}>
          <Thead>
            <Tr>
              <TableHeaders headers={headers} sortCallback={setSort} />
            </Tr>
          </Thead>
          <Tbody>
            {!validators?.loading
              ? getSortedList().map((validator, i) => <ValidatorRow key={i} validator={validator}/>)
              : Array.from({ length: pageSize }, (x, i) => <ValidatorRow key={i} loading={true}/>)
            }
          </Tbody>
        </Table>
      </TableContainer>
    </div>
  )
}
