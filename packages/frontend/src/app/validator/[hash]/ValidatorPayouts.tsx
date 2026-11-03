import { Tooltip } from '@components/ui/Tooltips'
import { Skeleton } from '@components/home/Skeleton'
import { Badge } from '@components/ui/Badge/Badge'
import { creditsToDash, removeTrailingZeros } from '@utils'
import { validatorDashAmount } from '../../../util/validatorAmount'

export interface ValidatorPayoutsProps {
  total?: number | null
  loading: boolean
  error: boolean
}

export default function ValidatorPayouts({ total, loading, error }: ValidatorPayoutsProps) {
  const hasTotal = total != null && Number.isFinite(total) && total >= 0
  const failed = error || (total != null && !hasTotal)
  const amount = loading
    ? 'Loading…'
    : failed
      ? 'Error'
      : hasTotal
        ? `${validatorDashAmount(total)} DASH`
        : 'No data'
  const preciseAmount =
    hasTotal && !loading && !failed
      ? `${removeTrailingZeros(creditsToDash(total).toFixed(8))} DASH`
      : amount
  const colorScheme = loading
    ? 'dimGray'
    : failed
      ? 'red'
      : hasTotal && total > 0
        ? 'blue'
        : 'dimGray'
  const description = loading
    ? 'Loading payouts'
    : failed
      ? 'Could not load a valid payout total'
      : hasTotal
        ? 'Independent of date range. History may be incomplete.'
        : 'API returned no payout total'

  return (
    <Tooltip
      className="ValidatorPage__Tooltip"
      title="Indexed Platform payouts"
      content={
        <>
          {hasTotal && !loading && !failed && (
            <>
              {preciseAmount}
              <br />
            </>
          )}
          {description}
        </>
      }
    >
      <Badge
        className="ValidatorEpochs__PayoutMetric ValidatorPage__AmountBadge"
        size="xs"
        colorScheme={colorScheme}
        tabIndex={0}
        aria-label={`Indexed Platform payouts: ${preciseAmount}`}
      >
        {loading ? <Skeleton w={64} h="1em" /> : amount}
      </Badge>
    </Tooltip>
  )
}
