import { InfoLine } from '@components/data'
import { TransitionCard } from '@components/transactions'
import type { TransitionData } from 'src/components/transactions/TransitionCard'
import type { WithLoading, WithRate } from '../../types'

interface BatchProps extends WithLoading, WithRate {
  transitions?: TransitionData[] | null
  ownerId?: string | null
}

export const Batch = ({ transitions, ownerId, rate, loading }: BatchProps) => {
  const rateValue =
    rate && typeof rate === 'object' && 'data' in rate
      ? rate.data
      : (rate as { usd?: number } | null | undefined)

  return (
    <>
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Transitions'}
        title={`Transitions ${transitions !== undefined ? `(${transitions?.length})` : ''}`}
        value={
          <>
            {transitions?.map((transition, i) => (
              <TransitionCard
                className={'TransactionPage__TransitionCard'}
                transition={transition}
                owner={ownerId}
                rate={(rateValue ?? null) as { usd: number } | null}
                key={i}
              />
            ))}
          </>
        }
        loading={loading}
        error={transitions === undefined}
      />
    </>
  )
}
