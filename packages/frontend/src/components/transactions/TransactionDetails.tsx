import type { ReactNode } from 'react'
import InfoLine from '../data/InfoLine'
import Identifier from '../data/Identifier'
import ValueCard from '../cards/ValueCard'
import DateBlock from '../data/DateBlock'
import { formatTransactionAmount } from '../../util/transactionAmounts'
import './TransactionDetails.css'

export function DetailLine({ title, children }: { title: string; children: ReactNode }) {
  return (
    <InfoLine
      className="TransactionPage__InfoLine TransactionDetails__Line"
      title={title}
      value={children ?? 'Unavailable'}
    />
  )
}

export function EntityLine({
  title,
  identifier,
  entity
}: {
  title: string
  identifier?: string | null
  entity?: 'identity' | 'dataContract' | 'document' | 'token'
}) {
  return (
    <DetailLine title={title}>
      {identifier ? (
        <ValueCard link={entity ? `/${entity}/${encodeURIComponent(identifier)}` : undefined}>
          <Identifier copyButton styles={['highlight-both']}>
            {identifier}
          </Identifier>
        </ValueCard>
      ) : (
        'Unavailable'
      )}
    </DetailLine>
  )
}

export function CreditsLine({ title, amount }: { title: string; amount?: string | number | null }) {
  const formatted = formatTransactionAmount(amount)
  return (
    <DetailLine title={title}>
      {formatted == null ? 'Unavailable' : `${formatted} CREDITS`}
    </DetailLine>
  )
}

export function TimestampLine({
  title,
  timestamp
}: {
  title: string
  timestamp?: string | number | null
}) {
  const milliseconds = timestamp == null ? NaN : Number(timestamp)
  const valid =
    Number.isSafeInteger(milliseconds) && !Number.isNaN(new Date(milliseconds).getTime())
  return (
    <DetailLine title={title}>
      {valid ? <DateBlock timestamp={milliseconds} format="dateOnly" showTime /> : 'Unavailable'}
    </DetailLine>
  )
}

export function JsonDetails({ title = 'Decoded data', value }: { title?: string; value: unknown }) {
  if (value == null) return null
  return (
    <details className="TransactionDetails__Data">
      <summary>{title}</summary>
      <pre>
        {JSON.stringify(value, (_, item) => (typeof item === 'bigint' ? String(item) : item), 2)}
      </pre>
    </details>
  )
}

export function ProofDetails({
  title = 'Proof data',
  actions,
  anchor,
  proof,
  bindingsSignature
}: {
  title?: string
  actions?: unknown[] | null
  anchor?: string | null
  proof?: string | null
  bindingsSignature?: string | null
}) {
  if (actions == null && anchor == null && proof == null && bindingsSignature == null) return null

  return (
    <details className="TransactionDetails__Data">
      <summary>{title}</summary>
      {anchor != null && <EntityLine title="Anchor" identifier={anchor} />}
      {bindingsSignature != null && (
        <EntityLine title="Bindings Signature" identifier={bindingsSignature} />
      )}
      {proof != null && <EntityLine title="Proof" identifier={proof} />}
      {actions != null && <JsonDetails title={`Actions (${actions.length})`} value={actions} />}
    </details>
  )
}
