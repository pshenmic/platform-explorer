'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@chakra-ui/react'
import { WarningTwoIcon } from '@chakra-ui/icons'
import { Identifier, TimeDelta, NotActive } from '../data'
import TypeBadge from './TypeBadge'
import BatchTypeBadge from './BatchTypeBadge'
import TransactionStatusBadge from './TransactionStatusBadge'
import { TransactionsIcon, ChevronIcon } from '../ui/icons'

import './DuplicatedTransactions.scss'

const VISIBLE_COUNT = 3

function TypeBadgeCell ({ occurrence }) {
  if (occurrence?.batchType) {
    return (
      <BatchTypeBadge
        className={'DuplicatedTransactions__TypeBadge'}
        batchType={occurrence.batchType?.replace(/[\\""]/g, '')}
      />
    )
  }

  if (occurrence?.type !== undefined && occurrence?.type !== null) {
    return <TypeBadge className={'DuplicatedTransactions__TypeBadge'} type={occurrence.type}/>
  }

  return <NotActive/>
}

function OccurrenceRow ({ occurrence, selected, onSelect }) {
  const handleSelect = () => onSelect?.(occurrence?.blockHash)

  return (
    <div
      role={'button'}
      tabIndex={0}
      aria-pressed={selected}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleSelect()
        }
      }}
      className={`DuplicatedTransactions__Row ${selected ? 'DuplicatedTransactions__Row--Selected' : ''}`}
    >
      <div className={'DuplicatedTransactions__Main'}>
        <TransactionsIcon className={'DuplicatedTransactions__Icon'}/>
        <Identifier ellipsis={true} styles={['highlight-both']}>{occurrence?.hash}</Identifier>
      </div>

      <div className={'DuplicatedTransactions__Height'}>
        {occurrence?.blockHeight != null
          ? <span className={'DuplicatedTransactions__HeightChip'}>Height: {occurrence.blockHeight}</span>
          : <NotActive/>
        }
      </div>

      <div className={'DuplicatedTransactions__Type'}>
        <TypeBadgeCell occurrence={occurrence}/>
      </div>

      <div className={'DuplicatedTransactions__Time'}>
        {occurrence?.timestamp
          ? <TimeDelta endDate={new Date(occurrence.timestamp)}/>
          : <NotActive/>
        }
      </div>

      <div className={'DuplicatedTransactions__Status'}>
        {occurrence?.status
          ? <TransactionStatusBadge status={occurrence.status}/>
          : <NotActive/>
        }
      </div>

      <div className={'DuplicatedTransactions__Action'}>
        <Link
          href={`/block/${occurrence?.blockHash}`}
          onClick={(e) => e.stopPropagation()}
          className={'DuplicatedTransactions__ArrowLink'}
        >
          <Button className={'DuplicatedTransactions__ArrowButton'} size={'xxs'} variant={'blue'}>
            <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
          </Button>
        </Link>
      </div>
    </div>
  )
}

function DuplicatedTransactions ({ transaction, selectedBlockHash, onSelect }) {
  const [showAll, setShowAll] = useState(false)
  const duplicates = transaction?.duplicates

  if (!Array.isArray(duplicates) || duplicates.length === 0) return null

  const occurrences = [transaction, ...duplicates]
  const visibleOccurrences = showAll ? occurrences : occurrences.slice(0, VISIBLE_COUNT)
  const hasMore = occurrences.length > VISIBLE_COUNT

  return (
    <div className={'DuplicatedTransactions'}>
      <div className={'DuplicatedTransactions__Title'}>Duplicated Transactions</div>
      <div className={'DuplicatedTransactions__Notice'}>
        <WarningTwoIcon className={'DuplicatedTransactions__NoticeIcon'}/>
        <span>
          This transaction was included in more than one block
        </span>
      </div>
      <div className={'DuplicatedTransactions__List'}>
        {visibleOccurrences.map((occurrence, i) => (
          <OccurrenceRow
            key={`${occurrence?.blockHash || 'selected'}-${i}`}
            occurrence={occurrence}
            selected={occurrence?.blockHash === selectedBlockHash}
            onSelect={onSelect}
          />
        ))}
      </div>

      {hasMore && (
        <Button
          onClick={() => setShowAll(!showAll)}
          className={'DuplicatedTransactions__ShowMoreButton'}
          variant={showAll ? 'gray' : 'blue'}
          size={'sm'}
        >
          {showAll ? 'Show less' : 'Show more'}
          <ChevronIcon ml={'4px'} h={'10px'} w={'10px'} transform={`rotate(${showAll ? '-90deg' : '90deg'})`}/>
        </Button>
      )}
    </div>
  )
}

export default DuplicatedTransactions
