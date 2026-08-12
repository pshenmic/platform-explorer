'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@chakra-ui/react'
import { Identifier, NotActive, TimeDelta, BigNumber, DateBlock } from '../data'
import { BlockIcon } from '../ui/icons'
import { LinkContainer } from '../ui/containers'
import { DataList } from '../ui/lists'
// retained until transfers/withdrawals/contested/votes migrate — they borrow
// .BlocksList__ColumnTitles--Light and .BlocksListItem__LinkContainer from here
import './BlocksList.scss'
import './BlocksListItem.scss'

function BlocksList ({ blocks = [], headerStyles = 'default', absoluteDate }) {
  const router = useRouter()

  const columns = [
    {
      key: 'height',
      header: 'Height',
      minWidth: 88,
      priority: 4,
      cell: ({ header }) => (
        <>
          <BlockIcon w={'1.125rem'} h={'1.125rem'} mr={'0.5rem'}/>
          {header?.height ?? <NotActive>-</NotActive>}
        </>
      )
    },
    {
      key: 'hash',
      header: 'Block Hash',
      grow: true,
      minWidth: 120,
      cell: ({ header }) => (typeof header?.hash === 'string'
        ? <Identifier middleEllipsis={true} copyButton={true}>{header.hash}</Identifier>
        : null)
    },
    {
      key: 'validator',
      header: 'Proposed By',
      grow: 2,
      minWidth: 120,
      priority: 2,
      cell: ({ header }) => (
        <LinkContainer
          onClick={e => { e.stopPropagation(); e.preventDefault(); router.push(`/validator/${header?.validator}`) }}
        >
          <Identifier avatar={true} copyButton={true}>{header?.validator}</Identifier>
        </LinkContainer>
      )
    },
    {
      key: 'fees',
      header: 'Fees',
      minWidth: 84,
      align: 'center',
      priority: 1,
      cell: ({ header }) => (typeof header?.totalGasUsed === 'number' || typeof header?.totalGasUsed === 'string'
        ? <BigNumber>{header.totalGasUsed}</BigNumber>
        : <NotActive>-</NotActive>)
    },
    {
      key: 'txs',
      header: 'TXs count',
      minWidth: 72,
      align: 'center',
      priority: 3,
      cell: ({ txs }) => (typeof txs?.length === 'number' ? <Badge>{txs.length}</Badge> : null)
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      minWidth: absoluteDate ? 132 : 96,
      align: 'right',
      cell: ({ header }) => {
        if (!header?.timestamp) return <NotActive/>
        return absoluteDate
          ? <DateBlock format={'dateOnly'} showTime={true} timestamp={header.timestamp} showRelativeTooltip={true}/>
          : <TimeDelta showTimestampTooltip={true} endDate={new Date(header.timestamp)}/>
      }
    }
  ]

  return (
    <DataList
      className={'BlocksList'}
      items={blocks}
      columns={columns}
      rowHref={({ header }) => `/block/${header?.hash}`}
      rowKey={({ header }) => header?.hash}
      headerVariant={headerStyles === 'light' ? 'light' : 'default'}
      emptyMessage={'There are no blocks yet.'}
    />
  )
}

export default BlocksList
