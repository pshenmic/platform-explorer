'use client'

import type { ComponentType, ReactNode, KeyboardEvent } from 'react'
import { useState } from 'react'
import Link from 'next/link'

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
          <span className={'DuplicatedTransactions__ArrowButton'}>
            <ChevronIcon style={{ width: '0.5rem', height: '0.5rem' }} />
          </span>
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
        <svg
          className={'DuplicatedTransactions__NoticeIcon'}
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
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
        <button
          type={'button'}
          onClick={() => setShowAll(!showAll)}
          className={`DuplicatedTransactions__ShowMoreButton DuplicatedTransactions__ShowMoreButton--${
            showAll ? 'Gray' : 'Blue'
          }`}
        >
          {showAll ? 'Show less' : 'Show more'}
          <ChevronIcon
            style={{
              marginLeft: '4px',
              height: '10px',
              width: '10px',
              transform: `rotate(${showAll ? '-90deg' : '90deg'})`
            }}
          />
        </button>
      )}
    </div>
  )
}

export default DuplicatedTransactions
