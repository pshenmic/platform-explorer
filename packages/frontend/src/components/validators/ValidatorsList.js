'use client'

import { ListColumnsHeader } from '../ui/lists'
import { ValidatorListItem } from './ValidatorListItem'
import { Container } from '@chakra-ui/react'
import { ErrorMessageBlock } from '@components/Errors'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { LoadingLine } from '@components/loading'

import './ValidatorsList.scss'

const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('proTxHash', {
    header: 'proTxHash'
  }),
  columnHelper.accessor(row => row?.lastProposedBlockHeader?.height ?? 0, {
    id: 'lastBlockHeight',
    header: 'Last block height'
  }),
  columnHelper.accessor('proposedBlocksAmount', {
    header: 'Blocks proposed'
  })
]

const TableWrapper = ({ children }) => (
      <div className={'ValidatorsList'}>
      <div className={'ValidatorsList__ContentContainer'}>
          {children}
      </div>
    </div>
)

export default function ValidatorsList ({ loading, list, pageSize, error }) {
  const table = useReactTable({
    data: list,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true
  })

  if (error) {
    return <Container h={20}><ErrorMessageBlock /></Container>
  }

  if (loading) {
    return (
      <TableWrapper>
        {
          Array.from({
            length: String(pageSize).toLowerCase() === 'all'
              ? 50
              : pageSize
          }, (x, i) => <LoadingLine key={i} loading={loading} className={'ValidatorListItem ValidatorListItem--Loading'}/>)
        }
      </TableWrapper>
    )
  }

  return (
    <div className={'ValidatorsList'}>
      <div className={'ValidatorsList__ContentContainer'}>
        <ListColumnsHeader
          headers={table.getHeaderGroups().flatMap(({ headers }) => headers)}

          className={'ValidatorsList__ColumnTitles'}
          columnClassName={'ValidatorsList__ColumnTitle'}
        />
       {table.getRowModel().rows.map((row) => <ValidatorListItem key={row.id} validator={row.original} />)}
      </div>
    </div>
  )
}
