import type { EpochData, Rate, Status } from '../../../types'
import { RateTooltip } from '../../ui/Tooltips'
import { currencyRound } from '../../../util'
import { InfoIcon } from '../../ui/icons'
import './FeesCollectedCardContent.css'

interface FeesCollectedCardContentProps {
  epoch?: Pick<EpochData, 'totalCollectedFees'> | null
  status?: Pick<Status, 'totalCollectedFeesDay'> | null
  rate?: Pick<Rate, 'usd'> | null
}

export function FeesCollectedCardContent({ epoch, status, rate }: FeesCollectedCardContentProps) {
  return (
    <div className={'FeesCollectedCardContent'}>
      <div className={'FeesCollectedCardContent__TotalCollectedFees'}>
        {typeof epoch?.totalCollectedFees === 'number' ? (
          <RateTooltip credits={epoch.totalCollectedFees} rate={rate}>
            <span className={'FeesCollectedCardContent__FeesContainer'}>
              {currencyRound(epoch.totalCollectedFees)}
              <InfoIcon className={'FeesCollectedCardContent__InfoIcon'} />
            </span>
          </RateTooltip>
        ) : (
          'n/a'
        )}
      </div>
      {status?.totalCollectedFeesDay && (
        <div className={'FeesCollectedCardContent__Day'}>
          <span className={'FeesCollectedCardContent__DayLabel'}>Last 24h: </span>
          <span>
            {typeof status?.totalCollectedFeesDay === 'number'
              ? currencyRound(status?.totalCollectedFeesDay)
              : 'n/a'}
          </span>
        </div>
      )}
    </div>
  )
}
