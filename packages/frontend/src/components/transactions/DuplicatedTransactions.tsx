'use client'

import type { ComponentType, ReactNode, KeyboardEvent } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@chakra-ui/react'
import { WarningTwoIcon } from '@chakra-ui/icons'
// Untyped JS components — loose wrappers until data/* is migrated
import {
  Identifier as IdentifierJs,
  TimeDelta as TimeDeltaJs,
  NotActive as NotActiveJs
} from '../data'
import TypeBadge from './TypeBadge'
import BatchTypeBadge from './BatchTypeBadge'
import TransactionStatusBadge from './TransactionStatusBadge'
import { TransactionsIcon, ChevronIcon } from '../ui/icons'
import type { Transaction } from '../../types'

import './DuplicatedTransactions.css'

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  ellipsis?: boolean
  styles?: string[]
  avatar?: boolean
  copyButton?: boolean
  className?: string
}>
const TimeDelta = TimeDeltaJs as ComponentType<{
  endDate?: string | Date | null
  showTimestampTooltip?: boolean
}>
const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode; className?: string }>

const VISIBLE_COUNT = 3

/** Duplicates may be partial rows; occurrences include the primary transaction. */
type TransactionOccurrence = {
  hash?: string | null
  blockHash?: string | null
  blockHeight?: number | null
  batchType?: string | null
  type?: string | null
  timestamp?: string | null
  status?: string | null
}

interface TypeBadgeCellProps {
  occurrence: TransactionOccurrence
}

function TypeBadgeCell({ occurrence }: TypeBadgeCellProps) {
  if (occurrence?.batchType) {
    return (
      <BatchTypeBadge
        className={'DuplicatedTransactions__TypeBadge'}
        batchType={occurrence.batchType?.replace(/[\\""]/g, '')}
      />
    )
  }

  if (occurrence?.type !== undefined && occurrence?.type !== null) {
    return <TypeBadge className={'DuplicatedTransactions__TypeBadge'} type={occurrence.type} />
  }

  return <NotActive />
}

interface OccurrenceRowProps {
  occurrence: TransactionOccurrence
  selected?: boolean
  onSelect?: (blockHash?: string | null) => void
}

function OccurrenceRow({ occurrence, selected, onSelect }: OccurrenceRowProps) {
  const handleSelect = () => onSelect?.(occurrence?.blockHash)

  return (
    <div
      role={'button'}
      tabIndex={0}
      aria-pressed={selected}
      onClick={handleSelect}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleSelect()
        }
      }}
      className={`DuplicatedTransactions__Row ${selected ? 'DuplicatedTransactions__Row--Selected' : ''}`}
    >
      <div className={'DuplicatedTransactions__Main'}>
        <TransactionsIcon className={'DuplicatedTransactions__Icon'} />
        <Identifier ellipsis={true} styles={['highlight-both']}>
          {occurrence?.hash}
        </Identifier>
      </div>

      <div className={'DuplicatedTransactions__Height'}>
        {occurrence?.blockHeight != null ? (
          <span className={'DuplicatedTransactions__HeightChip'}>
            Height: {occurrence.blockHeight}
          </span>
        ) : (
          <NotActive />
        )}
      </div>

      <div className={'DuplicatedTransactions__Type'}>
        <TypeBadgeCell occurrence={occurrence} />
      </div>

      <div className={'DuplicatedTransactions__Time'}>
        {occurrence?.timestamp ? (
          <TimeDelta endDate={new Date(occurrence.timestamp)} />
        ) : (
          <NotActive />
        )}
      </div>

      <div className={'DuplicatedTransactions__Status'}>
        {occurrence?.status ? <TransactionStatusBadge status={occurrence.status} /> : <NotActive />}
      </div>

      <div className={'DuplicatedTransactions__Action'}>
        <Link
          href={`/block/${occurrence?.blockHash}`}
          onClick={e => e.stopPropagation()}
          className={'DuplicatedTransactions__ArrowLink'}
        >
          <Button className={'DuplicatedTransactions__ArrowButton'} size={'xxs'} variant={'blue'}>
            <ChevronIcon w={'0.5rem'} h={'0.5rem'} />
          </Button>
        </Link>
      </div>
    </div>
  )
}

interface DuplicatedTransactionsProps {
  transaction?: Transaction | null
  selectedBlockHash?: string | null
  onSelect?: (blockHash?: string | null) => void
}

function DuplicatedTransactions({
  transaction,
  selectedBlockHash,
  onSelect
}: DuplicatedTransactionsProps) {
  const [showAll, setShowAll] = useState(false)
  const duplicates = transaction?.duplicates

  if (!Array.isArray(duplicates) || duplicates.length === 0) return null

  const occurrences: TransactionOccurrence[] = [transaction as Transaction, ...duplicates]
  const visibleOccurrences = showAll ? occurrences : occurrences.slice(0, VISIBLE_COUNT)
  const hasMore = occurrences.length > VISIBLE_COUNT

  return (
    <div className={'DuplicatedTransactions'}>
      <div className={'DuplicatedTransactions__Title'}>Duplicated Transactions</div>
      <div className={'DuplicatedTransactions__Notice'}>
        <WarningTwoIcon className={'DuplicatedTransactions__NoticeIcon'} />
        <span>This transaction was included in more than one block</span>
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
          <ChevronIcon
            ml={'4px'}
            h={'10px'}
            w={'10px'}
            transform={`rotate(${showAll ? '-90deg' : '90deg'})`}
          />
        </Button>
      )}
    </div>
  )
}

export default DuplicatedTransactions
